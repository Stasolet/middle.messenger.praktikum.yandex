/**
 * Заглушка Практикум API для разработки, когда живой API недоступен.
 *
 * Ответы берутся из mocks/api/*.json в формате реальных ответов (snake_case),
 * сессия — cookie `sid`, как у живого API, поэтому проверается и вход, и
 * последующие запросы с нею. Данные изменяются в памяти: регистрация добавляет
 * пользователя, после перезапуска файла возвращаются к фикстурам.
 *
 *   npm run mock:api
 *   VITE_API_BASE_URL=http://localhost:4111 npm run dev
 *
 * Учетные записи и пароли — в mocks/api/users.json. Маршруты вне списка отвечают
 * 501 с текстом маршрута: недоделанное видно во вкладке Network.
 */
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join } from 'node:path';

const PORT = 4111;

const readFixture = async (fileName) =>
  JSON.parse(await readFile(join(import.meta.dirname, 'api', fileName), 'utf8'));

const accounts = await readFixture('users.json');
const chats = await readFixture('chats.json');

/** `sid` -> login */
const sessions = new Map();

let nextAccountId = Math.max(...accounts.map((account) => account.id)) + 1;

const loginFromRequest = (req) => {
  const sid = /(?:^|;\s*)sid=([^;]+)/.exec(req.headers.cookie ?? '')?.[1];
  return sid ? sessions.get(sid) : undefined;
};

const findAccount = (login) => accounts.find((account) => account.login === login);

const readJsonBody = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve(null);
      }
    });
  });

const unauthorized = (reply) => reply(401, { error: 'Пользователь не авторизован' });

const routes = {
  'POST /auth/signup': async (req, reply) => {
    const body = await readJsonBody(req);

    if (!body?.login || !body.password) {
      return reply(400, { error: 'Логин и пароль обязательны' });
    }

    if (findAccount(body.login)) {
      return reply(400, { error: 'Логин уже зарегистрирован' });
    }

    const id = nextAccountId++;
    accounts.push({
      id,
      login: body.login,
      password: body.password,
      first_name: body.first_name ?? '',
      second_name: body.second_name ?? '',
      display_name: body.display_name ?? null,
      email: body.email ?? '',
      phone: body.phone ?? '',
      avatar: null,
    });

    return reply(200, { id });
  },

  'POST /auth/signin': async (req, reply) => {
    const body = await readJsonBody(req);
    const account = accounts.find(
      (candidate) => candidate.login === body?.login && candidate.password === body?.password
    );

    if (!account) {
      return reply(400, { error: 'Неверный логин или пароль' });
    }

    const sid = randomUUID();
    sessions.set(sid, account.login);

    return reply(200, { id: account.id }, { 'set-cookie': `sid=${sid}; Path=/; SameSite=Lax` });
  },

  'POST /auth/logout': async (req, reply) => {
    const sid = /(?:^|;\s*)sid=([^;]+)/.exec(req.headers.cookie ?? '')?.[1];
    if (sid) {
      sessions.delete(sid);
    }

    return reply(200, {}, { 'set-cookie': 'sid=; Path=/; SameSite=Lax; Max-Age=0' });
  },

  'GET /auth/user': async (req, reply) => {
    const account = findAccount(loginFromRequest(req));

    if (!account) {
      return unauthorized(reply);
    }

    const { password, ...profile } = account;
    return reply(200, profile);
  },

  'PUT /user/profile': async (req, reply) => {
    const account = findAccount(loginFromRequest(req));

    if (!account) {
      return unauthorized(reply);
    }

    const body = await readJsonBody(req);

    if (!body) {
      return reply(400, { error: 'Ожидался объект с полями профиля' });
    }

    const owner = findAccount(body.login ?? account.login);
    if (owner && owner !== account) {
      return reply(400, { error: 'Логин уже зарегистрирован' });
    }

    const fields = [
      'first_name',
      'second_name',
      'display_name',
      'login',
      'email',
      'phone',
      'avatar',
    ];
    for (const field of fields) {
      if (field in body) {
        account[field] = body[field];
      }
    }

    const { password, ...profile } = account;
    return reply(200, profile);
  },

  'PUT /user/password': async (req, reply) => {
    const account = findAccount(loginFromRequest(req));

    if (!account) {
      return unauthorized(reply);
    }

    const body = await readJsonBody(req);

    if (!body?.newPassword) {
      return reply(400, { error: 'Новый пароль обязателен' });
    }

    if (body.oldPassword !== account.password) {
      return reply(400, { error: 'Старый пароль указан неверно' });
    }

    account.password = body.newPassword;
    return reply(200, {});
  },

  'GET /chats': async (req, reply) => {
    if (!loginFromRequest(req)) {
      return unauthorized(reply);
    }

    return reply(200, chats);
  },
};

createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0];
  const key = `${req.method} ${path}`;

  const cors = {
    'access-control-allow-origin': req.headers.origin ?? '*',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };

  const reply = (status, body, headers = {}) => {
    console.log(`${status} ${key}`);
    res.writeHead(status, { ...cors, ...headers });
    res.end(body === undefined ? undefined : JSON.stringify(body));
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors).end();
    return;
  }

  const handler = routes[key];

  if (!handler) {
    reply(501, { error: `Заглушка не реализует ${key}` });
    return;
  }

  handler(req, reply);
}).listen(PORT, () => {
  console.log(`Заглушка API: http://localhost:${PORT}`);
  console.log(`VITE_API_BASE_URL=http://localhost:${PORT} npm run dev`);
});
