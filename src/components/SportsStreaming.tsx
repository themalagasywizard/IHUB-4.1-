import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useRef, useEffect } from 'react';
import { protectIframe } from '../utils/contentBlocker';

const SportsStreaming = () => {
  const footballRef = useRef<HTMLIFrameElement>(null);
  const match2Ref = useRef<HTMLIFrameElement>(null);
  const match3Ref = useRef<HTMLIFrameElement>(null);
  // Add more refs as needed

  useEffect(() => {
    if (footballRef.current) protectIframe(footballRef.current);
    if (match2Ref.current) protectIframe(match2Ref.current);
    if (match3Ref.current) protectIframe(match3Ref.current);
    // Apply to more
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Football Streaming</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">Premier League Match</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              ref={footballRef}
              src="https://www.stream2watch.life/" // Replace with actual stream2watch football embed URL
              width="100%"
              height="400"
              allowFullScreen
              className="rounded-lg"
            />
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">Champions League Match</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              ref={match2Ref}
              src="https://www.stream2watch.life/" // Replace with actual URL
              width="100%"
              height="400"
              allowFullScreen
              className="rounded-lg"
            />
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">La Liga Match</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              ref={match3Ref}
              src="https://www.stream2watch.life/" // Replace with actual URL
              width="100%"
              height="400"
              allowFullScreen
              className="rounded-lg"
            />
          </CardContent>
        </Card>
        // Add more cards for other popular matches
      </div>
    </div>
  );
};

export default SportsStreaming; 