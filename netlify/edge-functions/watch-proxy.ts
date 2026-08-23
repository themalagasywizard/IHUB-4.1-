import { handleWatchProxy } from '../../server/watchProxy.ts';

export default async (request: Request) => {
  try {
    return await handleWatchProxy(request);
  } catch {
    return new Response('Unable to reach the video host', { status: 502 });
  }
};
