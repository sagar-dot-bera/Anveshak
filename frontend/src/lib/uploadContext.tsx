// Upload state lives here (mounted once at the app root) instead of inside
// the UploadPaper page component. Routes unmount their page component on
// every navigation, which used to wipe the selected file, form fields and
// in-progress upload the moment the user clicked to another screen.
import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { AnalysisStep } from '@/data/uploadMockData';

export interface UploadFormValues {
  title: string;
  authors: string;
  year: string;
  language: string;
}

const DEFAULT_KEYWORDS = ['Machine Learning', 'NLP'];

const DEFAULT_ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: 'extraction',
    label: 'Extraction',
    description: 'Extracting text and identifying bibliographic data.',
    status: 'waiting',
  },
  {
    id: 'embedding',
    label: 'Embedding',
    description: 'Vectorizing content for semantic search capabilities.',
    status: 'waiting',
  },
  {
    id: 'completion',
    label: 'Completion',
    description: 'Generating AI summary and finalizing document in library.',
    status: 'waiting',
  },
];

const DEFAULT_FORM_VALUES: UploadFormValues = {
  title: '',
  authors: '',
  year: new Date().getFullYear().toString(),
  language: 'English',
};

interface UploadContextValue {
  selectedFile: File | null;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;
  keywords: string[];
  setKeywords: Dispatch<SetStateAction<string[]>>;
  uploadProgress: number;
  setUploadProgress: Dispatch<SetStateAction<number>>;
  isUploading: boolean;
  setIsUploading: Dispatch<SetStateAction<boolean>>;
  isFetchingPdf: boolean;
  setIsFetchingPdf: Dispatch<SetStateAction<boolean>>;
  analysisSteps: AnalysisStep[];
  setAnalysisSteps: Dispatch<SetStateAction<AnalysisStep[]>>;
  formValues: UploadFormValues;
  setFormValues: Dispatch<SetStateAction<UploadFormValues>>;
  resetUploadState: () => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingPdf, setIsFetchingPdf] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>(DEFAULT_ANALYSIS_STEPS);
  const [formValues, setFormValues] = useState<UploadFormValues>(DEFAULT_FORM_VALUES);

  const resetUploadState = () => {
    setSelectedFile(null);
    setKeywords(DEFAULT_KEYWORDS);
    setUploadProgress(0);
    setIsUploading(false);
    setIsFetchingPdf(false);
    setAnalysisSteps(DEFAULT_ANALYSIS_STEPS);
    setFormValues(DEFAULT_FORM_VALUES);
  };

  return (
    <UploadContext.Provider
      value={{
        selectedFile,
        setSelectedFile,
        keywords,
        setKeywords,
        uploadProgress,
        setUploadProgress,
        isUploading,
        setIsUploading,
        isFetchingPdf,
        setIsFetchingPdf,
        analysisSteps,
        setAnalysisSteps,
        formValues,
        setFormValues,
        resetUploadState,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUploadContext(): UploadContextValue {
  const ctx = useContext(UploadContext);
  if (!ctx) {
    throw new Error('useUploadContext must be used within an UploadProvider');
  }
  return ctx;
}
