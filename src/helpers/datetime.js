function time(timestamp) {
    const date = new Date(timestamp);
    const options = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('ru-RU', options);
}

function date(timestamp) {
  const date = new Date(timestamp);
  const options = { day: '2-digit', month: 'short' };
  return date.toLocaleDateString('ru-RU', options);
}

export {date, time}