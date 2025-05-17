'use client';

import { useState } from 'react';
import { usePortfolio } from './portfolio-context';
import { Button } from '~/components/ui/button';
import { processUploadedFile } from '~/lib/client/file-processor';

export function FileUpload() {
  const { setStocks } = usePortfolio();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMessage('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // Use client-side processor to process the file
      const stocks = await processUploadedFile(file);
      setStocks(stocks);
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error processing file');
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="my-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="relative"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Portfolio Excel'}
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            disabled={isUploading}
          />
        </Button>
        <span className="text-sm text-gray-500">
          Upload your portfolio Excel file to get started.
        </span>
      </div>
      {errorMessage && (
        <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>
      )}
    </div>
  );
}
