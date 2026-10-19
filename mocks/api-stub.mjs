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
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';

const PORT = 4111;

const readFixture = async (fileName) =>
  JSON.parse(await readFile(join(import.meta.dirname, 'api', fileName), 'utf8'));

const accounts = await readFixture('users.json');
const chats = await readFixture('chats.json');

/** Состав чатов: создатель и собеседник — чтобы добавление и удаление участника было на чём проверить */
const members = new Map(
  chats.map((chat) => [chat.id, [chat.created_by, chat.created_by === 1 ? 2 : 1]])
);

/** Загрузки лежат плоско: в профиле остаётся имя файла, URL клиент собирает из `/resources` */
const uploadsDir = await mkdtemp(join(tmpdir(), 'messenger-api-stub-'));

const contentTypes = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

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

/** `multipart/form-data` разбирает нативный `FormData` из Web API Node */
const readMultipart = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const request = new Request('http://stub', {
    method: 'PUT',
    headers: { 'content-type': req.headers['content-type'] ?? '' },
    body: Buffer.concat(chunks),
  });

  return request.formData();
};

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

  'PUT /user/profile/avatar': async (req, reply) => {
    const account = findAccount(loginFromRequest(req));

    if (!account) {
      return unauthorized(reply);
    }

    const file = (await readMultipart(req)).get('avatar');
    const extension = file instanceof File ? extname(file.name).toLowerCase() : '';

    if (!Object.hasOwn(contentTypes, extension)) {
      return reply(400, { error: 'Аватар — изображение png, jpeg, gif или webp' });
    }

    const name = `${randomUUID()}${extension}`;
    await writeFile(join(uploadsDir, name), Buffer.from(await file.arrayBuffer()));
    account.avatar = name;

    const { password, ...profile } = account;
    return reply(200, profile);
  },

  'POST /chats': async (req, reply) => {
    const account = findAccount(loginFromRequest(req));

    if (!account) {
      return unauthorized(reply);
    }

    const body = await readJsonBody(req);
    const title = typeof body?.title === 'string' ? body.title.trim() : '';

    if (!title) {
      return reply(400, { error: 'Название чата обязательно' });
    }

    const id = Math.max(0, ...chats.map((chat) => chat.id)) + 1;
    chats.push({
      id,
      title,
      avatar: null,
      unread_count: 0,
      created_by: account.id,
      last_message: null,
    });
    members.set(id, [account.id]);

    return reply(200, { id });
  },

  'DELETE /chats': async (req, reply) => {
    const account = findAccount(loginFromRequest(req));

    if (!account) {
      return unauthorized(reply);
    }

    const body = await readJsonBody(req);
    const chatId = Number(body?.chatId);
    const index = chats.findIndex((chat) => chat.id === chatId);

    if (index === -1) {
      return reply(400, { error: 'Чат не найден' });
    }

    if (chats[index].created_by !== account.id) {
      return reply(403, { error: 'Чат может удалить только его создатель' });
    }

    chats.splice(index, 1);
    members.delete(chatId);
    return reply(200, {});
  },

  'PUT /chats/users': async (req, reply) => {
    const account = findAccount(loginFromRequest(req));

    if (!account) {
      return unauthorized(reply);
    }

    const body = await readJsonBody(req);
    const chat = chats.find((candidate) => candidate.id === Number(body?.chatId));
    const ids = Array.isArray(body?.users) ? body.users.map(Number) : [];

    if (!chat) {
      return reply(400, { error: 'Чат не найден' });
    }

    const unknown = ids.filter((id) => !accounts.some((candidate) => candidate.id === id));
    if (unknown.length > 0) {
      return reply(400, { error: `Пользователь ${unknown.join(', ')} не найден` });
    }

    const list = members.get(chat.id) ?? [];
    members.set(chat.id, [...new Set([...list, ...ids])]);
    return reply(200, {});
  },

  'DELETE /chats/users': async (req, reply) => {
    const account = findAccount(loginFromRequest(req));

    if (!account) {
      return unauthorized(reply);
    }

    const body = await readJsonBody(req);
    const chat = chats.find((candidate) => candidate.id === Number(body?.chatId));
    const ids = Array.isArray(body?.users) ? body.users.map(Number) : [];

    if (!chat) {
      return reply(400, { error: 'Чат не найден' });
    }

    const list = members.get(chat.id) ?? [];
    const missing = ids.filter((id) => !list.includes(id));

    if (missing.length > 0) {
      return reply(400, { error: 'Эти пользователи в чат не добавлены' });
    }

    members.set(
      chat.id,
      list.filter((id) => !ids.includes(id))
    );
    return reply(200, {});
  },

  'POST /user/search': async (req, reply) => {
    const account = findAccount(loginFromRequest(req));

    if (!account) {
      return unauthorized(reply);
    }

    const body = await readJsonBody(req);
    const term = typeof body?.login === 'string' ? body.login.trim().toLowerCase() : '';

    if (!term) {
      return reply(400, { error: 'Укажите логин для поиска' });
    }

    const found = accounts
      .filter((candidate) => candidate.login.toLowerCase().includes(term))
      .map(({ password, ...profile }) => ({ ...profile, role: 'User' }));

    return reply(200, found);
  },

  'GET /chats': async (req, reply) => {
    const account = findAccount(loginFromRequest(req));

    if (!account) {
      return unauthorized(reply);
    }

    return reply(
      200,
      chats.filter((chat) => (members.get(chat.id) ?? []).includes(account.id))
    );
  },
};

createServer(async (req, res) => {
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

  if (req.method === 'GET' && path.startsWith('/resources/')) {
    const name = basename(path);

    try {
      const data = await readFile(join(uploadsDir, name));
      console.log(`200 ${key}`);
      res.writeHead(200, { ...cors, 'content-type': contentTypes[extname(name).toLowerCase()] });
      res.end(data);
    } catch {
      reply(404, { error: 'Файл не найден' });
    }
    return;
  }

  const handler = routes[key];

  if (!handler) {
    reply(501, { error: `Заглушка не реализует ${key}` });
    return;
  }

  try {
    await handler(req, reply);
  } catch {
    reply(500, { error: 'Внутренняя ошибка заглушки' });
  }
}).listen(PORT, () => {
  console.log(`Заглушка API: http://localhost:${PORT}`);
  console.log(`VITE_API_BASE_URL=http://localhost:${PORT} npm run dev`);
});
