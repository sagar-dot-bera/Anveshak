import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Upload,
  FileUp,
  Lock,
  Check,
  Circle,
  Plus,
  X,
  Sparkles,
  Lightbulb,
  ShieldCheck,
  AlignLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { createPaper } from '@/api/papersApi';
import {
  mockLanguages,
  mockInfoCards,
  type AnalysisStep,
} from '@/data/uploadMockData';

const metadataSchema = z.object({
  title: z.string().optional(),
  authors: z.string().optional(),
  year: z.string().optional(),
  language: z.string(),
});

interface MetadataFormValues {
  title?: string;
  authors?: string;
  year?: string;
  language: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb,
  Sparkles,
  ShieldCheck,
};

// Step status icon component
function StepIcon({ status }: { status: 'completed' | 'in-progress' | 'waiting' }) {
  if (status === 'completed') {
    return (
      <div className="w-7 h-7 rounded-full bg-success-green flex items-center justify-center flex-shrink-0 shadow-sm">
        <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
      </div>
    );
  }
  if (status === 'in-progress') {
    return (
      <div className="w-7 h-7 rounded-full border-2 border-primary bg-white flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center flex-shrink-0">
      <Circle className="w-2 h-2 text-slate-300 fill-slate-200" />
    </div>
  );
}

export default function UploadPaper() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [keywords, setKeywords] = useState<string[]>(['Machine Learning', 'NLP']);
  const [keywordInput, setKeywordInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
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
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataSchema),
    defaultValues: { language: 'English', year: new Date().getFullYear().toString() },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      toast.success('PDF selected', { description: file.name });
    } else {
      toast.error('Invalid file type', { description: 'Please upload a PDF file.' });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success('PDF selected', { description: file.name });
    }
  };

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const onSubmit = async (data: MetadataFormValues) => {
    if (!selectedFile) {
      toast.error('No file selected', { description: 'Please upload a PDF before saving.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);
    setAnalysisSteps([
      { ...analysisSteps[0], status: 'in-progress' },
      { ...analysisSteps[1], status: 'waiting' },
      { ...analysisSteps[2], status: 'waiting' },
    ]);

    // Progress simulation interval
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        const nextVal = prev + Math.floor(Math.random() * 8) + 2;

        // Update steps status based on progress simulation
        setAnalysisSteps((prevSteps) => {
          const stepsCopy = [...prevSteps];
          if (nextVal >= 30 && nextVal < 70) {
            stepsCopy[0].status = 'completed';
            stepsCopy[1].status = 'in-progress';
          } else if (nextVal >= 70) {
            stepsCopy[0].status = 'completed';
            stepsCopy[1].status = 'completed';
            stepsCopy[2].status = 'in-progress';
          }
          return stepsCopy;
        });

        return nextVal;
      });
    }, 400);

    try {
      const parsedYear = Number(data.year) || new Date().getFullYear();
      const authorsArray = data.authors
        ? data.authors.split(',').map((a) => a.trim()).filter(Boolean)
        : [];

      const paperPayload = {
        title: data.title?.trim() || selectedFile.name.replace(/\.[^/.]+$/, ''),
        abstractText: `Research paper uploaded in ${data.language}.`,
        authors: authorsArray.length > 0 ? authorsArray : ['Unknown Author'],
        publicationYear: parsedYear,
        keywords: keywords.length > 0 ? keywords : ['Research'],
      };

      await createPaper(paperPayload, selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setAnalysisSteps([
        { ...analysisSteps[0], status: 'completed' },
        { ...analysisSteps[1], status: 'completed' },
        { ...analysisSteps[2], status: 'completed' },
      ]);

      toast.success('Paper uploaded and analyzed successfully!', {
        description: `"${paperPayload.title}" has been saved to your library.`,
      });

      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        setKeywords(['Machine Learning', 'NLP']);
        reset();
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      setAnalysisSteps([
        { ...analysisSteps[0], status: 'waiting' },
        { ...analysisSteps[1], status: 'waiting' },
        { ...analysisSteps[2], status: 'waiting' },
      ]);
      const errMsg = err.response?.data?.msg || err.response?.data?.error || 'Failed to analyze the paper.';
      toast.error('Upload failed', {
        description: errMsg,
      });
    }
  };

  return (
    <div className="px-6 md:px-8 pt-6 pb-10 max-w-[1440px] space-y-6">

      {/* ── Page Header ─────────────────────────────────── */}
      <div>
        <h1 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 leading-none">
          Upload Research Paper
        </h1>
        <p className="font-inter text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Enhance your library by uploading a PDF. Our AI will automatically extract metadata,
          index the content, and generate embeddings for semantic querying.
        </p>
      </div>

      {/* ── Main Two-Column Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

        {/* LEFT COLUMN */}
        <div className="space-y-5">

          {/* Drag & Drop Zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload PDF drop zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-all cursor-pointer min-h-[320px] select-none
              ${isDragOver
                ? 'border-primary bg-indigo-50/60 scale-[1.005]'
                : selectedFile
                  ? 'border-success-green bg-emerald-50/40'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors
              ${isDragOver ? 'bg-indigo-100' : selectedFile ? 'bg-emerald-100' : 'bg-slate-100'}`}>
              {selectedFile ? (
                <Check className="w-7 h-7 text-success-green" strokeWidth={2.5} />
              ) : (
                <FileUp className={`w-7 h-7 transition-colors ${isDragOver ? 'text-primary' : 'text-slate-400'}`} />
              )}
            </div>

            {/* Text */}
            <div className="text-center space-y-1.5 px-4">
              {selectedFile ? (
                <>
                  <p className="font-hanken font-semibold text-base text-success-green">
                    {selectedFile.name}
                  </p>
                  <p className="font-inter text-xs text-slate-400">
                    Click to change file
                  </p>
                </>
              ) : (
                <>
                  <p className="font-hanken font-semibold text-base text-slate-700">
                    {isDragOver ? 'Release to upload' : 'Drag and drop your PDF'}
                  </p>
                  <p className="font-inter text-sm text-slate-400">
                    Or click to browse from your local files
                  </p>
                </>
              )}
            </div>

            {/* Badges */}
            {!selectedFile && (
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 font-inter text-xs text-slate-400 border border-slate-200 rounded-full px-3 py-1 bg-white">
                  <Upload className="w-3 h-3" />
                  Max 50MB
                </span>
                <span className="flex items-center gap-1.5 font-inter text-xs text-slate-400 border border-slate-200 rounded-full px-3 py-1 bg-white">
                  <Lock className="w-3 h-3" />
                  Secure Encrypted
                </span>
              </div>
            )}
          </div>

          {/* Analysis Status Card */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-hanken font-semibold text-base text-slate-900">
                Analysis Status
              </h2>
              <span className="font-mono text-[10px] font-bold tracking-wider text-vibrant-blue bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
                {uploadProgress}% Processed
              </span>
            </div>

            <div className="space-y-0">
              {analysisSteps.map((step, idx) => (
                <div key={step.id} className="flex gap-4">
                  {/* Left: icon + connector */}
                  <div className="flex flex-col items-center">
                    <StepIcon status={step.status} />
                    {idx < analysisSteps.length - 1 && (
                      <div className={`w-0.5 flex-1 my-1 rounded-full min-h-[28px] transition-colors ${step.status === 'completed' ? 'bg-success-green' : 'bg-slate-200'
                        }`} />
                    )}
                  </div>

                  {/* Right: content */}
                  <div className="pb-5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-hanken font-semibold text-sm text-slate-800">
                        {step.label}
                      </p>
                      <span className={`font-mono text-[10px] font-semibold tracking-wide flex-shrink-0 ${step.status === 'completed' ? 'text-success-green' :
                          step.status === 'in-progress' ? 'text-vibrant-blue' :
                            'text-slate-400'
                        }`}>
                        {step.status === 'completed' ? 'Completed' :
                          step.status === 'in-progress' ? 'In Progress...' : 'Waiting'}
                      </span>
                    </div>
                    {/* Progress bar for in-progress step */}
                    {step.status === 'in-progress' && (
                      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-vibrant-blue rounded-full transition-all duration-700"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}

                    <p className="font-inter text-xs text-slate-400 mt-1.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Paper Metadata Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isUploading} className="space-y-5">
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] space-y-5">
              {/* Panel Title */}
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-vibrant-blue" />
                <h2 className="font-hanken font-semibold text-base text-slate-900">
                  Paper Metadata
                </h2>
              </div>

              {/* Paper Title */}
              <div className="space-y-1.5">
                <label className="block font-inter text-xs font-medium text-slate-700">
                  Paper Title
                </label>
                <input
                  type="text"
                  placeholder="Enter paper title"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg font-inter text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue transition-all"
                  {...register('title')}
                />
              </div>

              {/* Authors */}
              <div className="space-y-1.5">
                <label className="block font-inter text-xs font-medium text-slate-700">
                  Authors
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Smith, John Doe"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg font-inter text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue transition-all"
                  {...register('authors')}
                />
                <p className="font-inter text-[10px] text-slate-400">
                  Separate multiple authors with commas.
                </p>
              </div>

              {/* Year + Language row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-inter text-xs font-medium text-slate-700">
                    Year
                  </label>
                  <input
                    type="number"
                    placeholder="2024"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg font-inter text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue transition-all"
                    {...register('year')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-inter text-xs font-medium text-slate-700">
                    Language
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue transition-all pr-8 cursor-pointer"
                      {...register('language')}
                    >
                      {mockLanguages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <label className="block font-inter text-xs font-medium text-slate-700">
                  Keywords
                </label>

                {/* Keyword tags */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 font-inter text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-full pl-2.5 pr-1.5 py-0.5"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="hover:text-error-red transition-colors rounded-full"
                        aria-label={`Remove keyword ${kw}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add keyword input */}
                <div className="relative">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addKeyword(); }
                    }}
                    placeholder="Add keyword..."
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-200 rounded-lg font-inter text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue transition-all"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-slate-100 hover:bg-indigo-100 hover:text-primary flex items-center justify-center text-slate-400 transition-colors"
                    aria-label="Add keyword"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                Confirm &amp; Save to Library
              </button>

              {/* Terms */}
              <p className="font-mono text-[10px] text-center text-slate-400 leading-relaxed" />
              By uploading, you agree to our{' '}
              <button
                type="button"
                onClick={() => toast.info('Terms of Service — coming soon.')}
                className="underline hover:text-slate-600 transition-colors"
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <span className="underline cursor-pointer hover:text-slate-600 transition-colors">
                Privacy Policy
              </span>
              .
            </div>
          </fieldset>
        </form>
      </div>

      {/* ── Info Cards Row ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockInfoCards.map((card) => {
          const Icon = iconMap[card.icon] ?? Lightbulb;
          return (
            <div
              key={card.id}
              className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="font-hanken font-semibold text-sm text-slate-900 mb-1.5">
                {card.title}
              </p>
              <p className="font-inter text-xs text-slate-500 leading-relaxed">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
