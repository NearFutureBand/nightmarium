import { useActionState, useEffect, useRef } from 'react';
import { useWebsocket } from 'src/modules/websocket';
import { restoreHostAndPort } from 'src/utils/saveHostAndPort';

const { host, port } = restoreHostAndPort();

export const ConnectionPage = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const connect = useWebsocket((state) => state.connect);

  const [, submitAction, isPending] = useActionState(async (_: any, formData: FormData) => {
    const host = formData.get('host') as string | null;
    const port = formData.get('port') as string | null;
    if (host && port) {
      connect(host, port);
    }
  }, null);

  useEffect(() => {
    if (host && port) {
      formRef.current?.requestSubmit();
    }
  }, []);

  return (
    <main className="min-h-dvh flex flex-col justify-center items-center gap-6 p-2">
      <h1>Выберите подключение</h1>
      <form
        action={submitAction}
        className="flex gap-2 items-center flex-col md:flex-row"
        ref={formRef}>
        <button type="submit" disabled={isPending}>
          Подключиться
        </button>{' '}
        к серверу
        <input type="text" name="host" placeholder="HOST" required defaultValue={host} />
        <span className="hidden md:block">:</span>
        <input type="text" name="port" placeholder="PORT" required defaultValue={port} />
      </form>
    </main>
  );
};
