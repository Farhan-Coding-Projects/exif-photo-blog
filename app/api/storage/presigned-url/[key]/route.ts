import { auth } from '@/auth/server';
import { getSignedUrlForKey } from '@/platforms/storage';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  const session = await auth();
  
  if (session?.user && key) {
    try {
      const url = await getSignedUrlForKey(key, 'PUT');
      return new Response(
        url,
        { headers: { 'content-type': 'text/plain' } },
      );
    } catch (error) {
      console.error('Unable to create storage upload URL', error);
      return new Response('Unable to create storage upload URL', { status: 500 });
    }
  } else {
    return new Response('Unauthorized request', { status: 401 });
  }
}
