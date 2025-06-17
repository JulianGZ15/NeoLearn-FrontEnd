import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private socket: WebSocket | null = null;
  private roomId: string = '';

  private localStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  private remoteStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  private connectionStateSubject = new BehaviorSubject<string>('disconnected');

  public localStream$ = this.localStreamSubject.asObservable();
  public remoteStream$ = this.remoteStreamSubject.asObservable();
  public connectionState$ = this.connectionStateSubject.asObservable();

  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  async initializeMedia(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      this.localStreamSubject.next(this.localStream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  connectToRoom(roomId: string): void {
    this.roomId = roomId;
    this.socket = new WebSocket('ws://localhost:8080/video-call');
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.joinRoom();
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleSignalingMessage(message);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.connectionStateSubject.next('disconnected');
    };
  }

  private joinRoom(): void {
    if (this.socket) {
      this.socket.send(JSON.stringify({
        type: 'join',
        roomId: this.roomId
      }));
    }
  }

  private async handleSignalingMessage(message: any): Promise<void> {
    switch (message.type) {
      case 'user-joined':
        await this.createOffer();
        break;
      case 'offer':
        await this.handleOffer(message);
        break;
      case 'answer':
        await this.handleAnswer(message);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(message);
        break;
      case 'user-left':
        this.handleUserLeft();
        break;
    }
  }

  private async createPeerConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          roomId: this.roomId
        }));
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.remoteStreamSubject.next(this.remoteStream);
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        this.connectionStateSubject.next(this.peerConnection.connectionState);
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    }
  }

  private async createOffer(): Promise<void> {
    await this.createPeerConnection();
    
    if (this.peerConnection) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      if (this.socket) {
        this.socket.send(JSON.stringify({
          type: 'offer',
          offer: offer,
          roomId: this.roomId
        }));
      }
    }
  }

  private async handleOffer(message: any): Promise<void> {
    await this.createPeerConnection();
    
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(message.offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      if (this.socket) {
        this.socket.send(JSON.stringify({
          type: 'answer',
          answer: answer,
          roomId: this.roomId
        }));
      }
    }
  }

  private async handleAnswer(message: any): Promise<void> {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(message.answer);
    }
  }

  private async handleIceCandidate(message: any): Promise<void> {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(message.candidate);
    }
  }

  private handleUserLeft(): void {
    this.remoteStreamSubject.next(null);
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  toggleVideo(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }

  toggleAudio(): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.send(JSON.stringify({
        type: 'leave',
        roomId: this.roomId
      }));
      this.socket.close();
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStreamSubject.next(null);
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStreamSubject.next(null);
    this.connectionStateSubject.next('disconnected');
  }
}