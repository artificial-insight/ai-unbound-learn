import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, Monitor, PhoneOff } from "lucide-react";
import { WebRTCClient } from "@/utils/WebRTC";
import { useToast } from "@/hooks/use-toast";

interface VideoConferenceProps {
  sessionId: string;
  onEnd?: () => void;
}

export const VideoConference = ({ sessionId, onEnd }: VideoConferenceProps) => {
  const { toast } = useToast();
  const [webRTC, setWebRTC] = useState<WebRTCClient | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initializeWebRTC();

    return () => {
      webRTC?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const initializeWebRTC = async () => {
    try {
      const client = new WebRTCClient(
        (stream) => {
          setRemoteStream(stream);
          setIsConnected(true);
        },
        (message) => {
          console.log('Data channel message:', message);
        }
      );

      await client.initialize();
      const stream = await client.startLocalStream();
      setLocalStream(stream);
      setWebRTC(client);

      toast({
        title: "Connected",
        description: "Video conference initialized",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleVideo = () => {
    webRTC?.toggleVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    webRTC?.toggleAudio(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await webRTC?.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        await webRTC?.startScreenShare();
        setIsScreenSharing(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to share screen",
        variant: "destructive",
      });
    }
  };

  const handleEndCall = () => {
    webRTC?.disconnect();
    onEnd?.();
  };

  return (
    <div className="space-y-4">
      {/* Remote Video */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-muted">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Waiting for connection...</p>
                </div>
              </div>
            )}

            {/* Connection Status */}
            <div className="absolute top-4 left-4">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? 'Connected' : 'Connecting...'}
              </Badge>
            </div>

            {/* Local Video (Picture-in-Picture) */}
            {localStream && (
              <div className="absolute bottom-4 right-4 w-48 aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-border">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-card border-t border-border">
            <div className="flex items-center justify-center gap-3">
              <Button
                variant={isAudioEnabled ? "secondary" : "destructive"}
                size="icon"
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              
              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="icon"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              
              <Button
                variant={isScreenSharing ? "default" : "secondary"}
                size="icon"
                onClick={toggleScreenShare}
              >
                <Monitor className="w-4 h-4" />
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={handleEndCall}
              >
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
