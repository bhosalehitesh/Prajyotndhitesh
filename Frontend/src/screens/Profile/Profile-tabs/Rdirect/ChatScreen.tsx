import React from 'react';
import ChatBot from '../../../../components/ChatBot';

export default function ChatScreen({ onBack }: { onBack: () => void }) {
  return <ChatBot onBack={onBack} isModal={false} />;
}
