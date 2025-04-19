export const saveHostAndPort = (host: string, port: string) => {
  localStorage.setItem('host', host);
  localStorage.setItem('port', port);
}

export const restoreHostAndPort = () => {
  const host = localStorage.getItem('host') || '';
  const port = localStorage.getItem('port') || '';
  return { host, port };
}

export const clearPortAndHost = () => {
  localStorage.removeItem('host');
  localStorage.removeItem('port');
}