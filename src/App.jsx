import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import CameraView from './components/CameraView';
import PhotoEditor from './components/PhotoEditor';
import ResultView from './components/ResultView';
import CustomCursor from './components/CustomCursor';
import { FRAME_LAYOUTS } from './utils/filters';

export default function App() {
  // Current screen: 'landing' | 'camera' | 'editor' | 'result'
  const [currentStep, setCurrentStep] = useState('landing');
  const [selectedLayout, setSelectedLayout] = useState(FRAME_LAYOUTS[0]); // Default 3-Strip
  const [capturedPhotos, setCapturedPhotos] = useState([]);

  // Editor state payload when moving to results
  const [editorData, setEditorData] = useState(null);

  // Handlers
  const handleStartFromLanding = () => {
    setCurrentStep('camera');
  };

  const handlePhotosCaptured = (photos) => {
    setCapturedPhotos(photos);
    setCurrentStep('editor');
  };

  const handleProceedToResult = (data) => {
    setEditorData(data);
    setCurrentStep('result');
  };

  const handleRetakePhotos = () => {
    setCapturedPhotos([]);
    setCurrentStep('camera');
  };

  const handleEditAgain = () => {
    setCurrentStep('editor');
  };

  const handleResetToHome = () => {
    setCapturedPhotos([]);
    setEditorData(null);
    setCurrentStep('landing');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-200 font-sans">

      {/* Sleek Custom Trailing Cursor */}
      <CustomCursor />

      {/* Top Navbar */}
      <Navbar
        currentStep={currentStep}
        onReset={handleResetToHome}
      />

      {/* Main Screen Views */}
      <main className="flex-1 flex flex-col">
        {currentStep === 'landing' && (
          <LandingPage
            selectedLayout={selectedLayout}
            onSelectLayout={setSelectedLayout}
            onStart={handleStartFromLanding}
          />
        )}

        {currentStep === 'camera' && (
          <CameraView
            layout={selectedLayout}
            onPhotosCaptured={handlePhotosCaptured}
            onCancel={handleResetToHome}
          />
        )}

        {currentStep === 'editor' && (
          <PhotoEditor
            photos={capturedPhotos}
            layout={selectedLayout}
            onProceedToResult={handleProceedToResult}
            onRetake={handleRetakePhotos}
            initialFilter={editorData?.filterId || 'normal'}
            initialStickers={editorData?.stickers || []}
            initialColorId={editorData?.frameColorId || 'navy'}
            initialCustomColor={editorData?.customColor || '#2563EB'}
            initialPatternId={editorData?.framePatternId || 'none'}
            initialFramePadding={editorData?.framePadding || 'standard'}
            initialEnableFilmGrain={editorData?.enableFilmGrain || false}
            initialWatermarkPosition={editorData?.watermarkPosition || 'bottom'}
            initialCaption={editorData?.caption || 'STUDIO MEMORIES'}
            initialDate={editorData?.dateString || ''}
          />
        )}

        {currentStep === 'result' && editorData && (
          <ResultView
            editorData={editorData}
            onEditAgain={handleEditAgain}
            onRetakeAll={handleResetToHome}
          />
        )}
      </main>

    </div>
  );
}
