'use client';

import { AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import LoadingAnimation from '../SubLoader';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const PDFViewer = ({ pdfUrl, className = '', onLoad, onError }) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);
  const iframeRef = useRef(null);

  useEffect(() => {
    let blobUrl = null;
    const controller = new AbortController();

    const loadPdf = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(pdfUrl, {
          signal: controller.signal,
          credentials: 'include'
        });

        if (!response.ok) {
          toast.error(`Failed to load PDF: ${response.statusText}`);
        }

        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
        onLoad?.();
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('PDF load error:', err)
          setError(err.message || 'Failed to load PDF')
          onError?.(err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadPdf();

    return () => {
      controller.abort()
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [pdfUrl, onLoad, onError])

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  // Disable right-click and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (isLoading) return <LoadingAnimation />

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-red-50 p-4 ${className}`}>
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="mt-2 text-center text-red-600">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={`relative flex flex-col border rounded-lg overflow-hidden bg-gray-50 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            aria-label="Zoom out"
            className="cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScale(1)} // Reset to 100%
            aria-label="Reset zoom"
            className="cursor-pointer px-2 text-xs"
          >
            Reset
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3}
            aria-label="Zoom in"
            className="cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <span className="flex items-center px-2 text-sm">
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 overflow-auto">
        {pdfBlobUrl && (
          <iframe
            ref={iframeRef}
            src={`${pdfBlobUrl}#toolbar=0&navpanes=0&view=fitH`}
            className="w-full h-full border-0 min-h-[80vh]"
            style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
            loading="eager"
            title="PDF Document"
          />
        )}
      </div>
    </div>
  )
}

export default PDFViewer;