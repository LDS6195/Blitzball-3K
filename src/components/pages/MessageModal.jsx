import React from 'react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';

export const MessageModal = ({ text, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm border border-cyan-500 shadow-2xl">
        <CardHeader><h3 className="text-lg font-semibold text-white">Notification</h3></CardHeader>
        <CardContent>
            <p className="text-gray-300 text-center text-lg">{text}</p>
        </CardContent>
        <div className="p-4 bg-gray-900 text-center">
            <Button onClick={onClose} variant="primary">OK</Button>
        </div>
      </Card>
    </div>
);
