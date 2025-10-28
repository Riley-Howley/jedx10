import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Eye, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { saveProgram, loadProgram, getAllPrograms, type Program, type Course, type ExerciseVideo } from '../supabaseHelpers';
import styles from './courseCreator.module.css';

import { v4 as uuidv4 } from 'uuid';

const generateId = () => uuidv4();

const CourseCreator: React.FC = () => {
  const [program, setProgram] = useState<Program>({
    title: '',
    description: '',
    duration: '',
    difficulty: '',
    focus: '',
    cost: '',
    courses: []
  });

  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [existingPrograms, setExistingPrograms] = useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');

  // Load existing programs on component mount
  useEffect(() => {
    loadExistingPrograms();
  }, []);

  const loadExistingPrograms = async () => {
    setIsLoading(true);
    try {
      const programs = await getAllPrograms();
      setExistingPrograms(programs);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSelectedProgram = async () => {
    if (!selectedProgramId) return;

    setIsLoading(true);
    try {
      const loadedProgram = await loadProgram(selectedProgramId);
      if (loadedProgram) {
        setProgram(loadedProgram);
        // Expand all courses for editing
        const courseIds = new Set(loadedProgram.courses!.map(c => c.id));
        setExpandedCourses(courseIds);
      }
    } catch (error) {
      console.error('Error loading program:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCourse = () => {
    const newCourse: Course = {
      id: generateId(),
      title: '',
      description: '',
      disclaimer: '',
      notes: '',
      options: [],
      videos: []
    };
    setProgram(prev => ({
      ...prev,
      courses: [...prev.courses!, newCourse]
    }));
    setExpandedCourses(prev => new Set([...prev, newCourse.id]));
  };

  const updateCourse = (courseId: string, field: keyof Course, value: any) => {
    setProgram(prev => ({
      ...prev,
      courses: prev.courses!.map(course =>
        course.id === courseId ? { ...course, [field]: value } : course
      )
    }));
  };

  const deleteCourse = (courseId: string) => {
    setProgram(prev => ({
      ...prev,
      courses: prev.courses!.filter(course => course.id !== courseId)
    }));
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      newSet.delete(courseId);
      return newSet;
    });
  };

  const addVideo = (courseId: string) => {
    const newVideo: ExerciseVideo = {
      id: generateId(),
      title: '',
      description: '',
      duration: '',
      difficulty: 'Beginner',
      order: 0
    };

    updateCourse(courseId, 'videos', [
      ...program.courses!.find(c => c.id === courseId)?.videos || [],
      newVideo
    ]);
  };

  const updateVideo = (courseId: string, videoId: string, field: keyof ExerciseVideo, value: any) => {
    const course = program.courses!.find(c => c.id === courseId);
    if (!course) return;

    const updatedVideos = course.videos.map(video =>
      video.id === videoId ? { ...video, [field]: value } : video
    );

    updateCourse(courseId, 'videos', updatedVideos);
  };

  const deleteVideo = (courseId: string, videoId: string) => {
    const course = program.courses!.find(c => c.id === courseId);
    if (!course) return;

    const updatedVideos = course.videos.filter(video => video.id !== videoId);
    updateCourse(courseId, 'videos', updatedVideos);
  };

  const addOption = (courseId: string) => {
    const course = program.courses!.find(c => c.id === courseId);
    if (!course) return;

    updateCourse(courseId, 'options', [...course.options, '']);
  };

  const updateOption = (courseId: string, index: number, value: string) => {
    const course = program.courses!.find(c => c.id === courseId);
    if (!course) return;

    const updatedOptions = [...course.options];
    updatedOptions[index] = value;
    updateCourse(courseId, 'options', updatedOptions);
  };

  const deleteOption = (courseId: string, index: number) => {
    const course = program.courses!.find(c => c.id === courseId);
    if (!course) return;

    const updatedOptions = course.options.filter((_, i) => i !== index);
    updateCourse(courseId, 'options', updatedOptions);
  };

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  // TODO: Figure out whether this is needed at all or else remove it
  // const handleVideoUpload = (courseId: string, videoId: string, file: File) => {
  //   updateVideo(courseId, videoId, 'videoUrl', URL.createObjectURL(file));
  // };

  const handleSaveProgram = async () => {
    if (!program.title.trim()) {
      alert('Please enter a program title');
      return;
    }

    setSaveStatus('saving');
    try {
      // If no ID exists, generate one for new program
      const programToSave = {
        ...program,
        id: program.id || generateId()
      };

      const result = await saveProgram(programToSave);

      if (result.success) {
        setSaveStatus('success');
        setProgram(prev => ({ ...prev, id: result.programId }));
        // Reload programs list
        await loadExistingPrograms();
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        alert(`Error saving program: ${result.error}`);
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving program:', error);
      alert('An unexpected error occurred while saving');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const createNewProgram = () => {
    setProgram({
      title: '',
      description: '',
      duration: '',
      difficulty: '',
      focus: '',
      cost: '',
      courses: []
    });
    setSelectedProgramId('');
    setExpandedCourses(new Set());
  };

  if (previewMode) {
    return (
      <div className={styles.courseCreator}>
        <div className={styles.courseCreatorContainer}>
          <div className={styles.courseCreatorHeader}>
            <h1 className={styles.courseCreatorTitle}>{program.title || 'Untitled Program'}</h1>
            <button
              onClick={() => setPreviewMode(false)}
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              Exit Preview
            </button>
          </div>

          {program.courses!.map((course, index) => (
            <div key={course.id} className={styles.coursePreview}>
              <h2 className={styles.coursePreviewTitle}>{course.title || `Course ${index + 1}`}</h2>
              <p className={styles.coursePreviewDescription}>{course.description}</p>

              {course.disclaimer && (
                <div className={styles.coursePreviewDisclaimer}>
                  <h3 className={styles.coursePreviewDisclaimerTitle}>Disclaimer</h3>
                  <p>{course.disclaimer}</p>
                </div>
              )}

              {course.notes && (
                <div className={styles.coursePreviewNotes}>
                  <h3 className={styles.coursePreviewNotesTitle}>Notes</h3>
                  <p>{course.notes}</p>
                </div>
              )}

              {course.options.length > 0 && (
                <div className={styles.coursePreviewOptions}>
                  <h3 className={styles.coursePreviewOptionsTitle}>Options</h3>
                  <ul className={styles.coursePreviewOptionsList}>
                    {course.options.map((option, i) => (
                      <li key={i}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.coursePreviewVideos}>
                <h3 className={styles.coursePreviewVideosTitle}>Exercise Videos ({course.videos.length})</h3>
                {course.videos.map((video, i) => (
                  <div key={video.id} className={styles.videoPreview}>
                    <div className={styles.videoPreviewHeader}>
                      <h4 className={styles.videoPreviewTitle}>{video.title || `Video ${i + 1}`}</h4>
                      <span className={`${styles.videoPreviewDifficulty} ${styles[`videoPreviewDifficulty${video.difficulty}`]}`}>
                        {video.difficulty}
                      </span>
                    </div>
                    <p className={styles.videoPreviewDescription}>{video.description}</p>
                    <div className={styles.videoPreviewMeta}>
                      <span>Duration: {video.duration || 'Not set'}</span>
                      {video.videoUrl && <span>Video uploaded</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.courseCreator}>
      <div className={styles.courseCreatorContainer}>
        <div className={styles.courseCreatorHeader}>
          <h2 className={styles.courseCreatorTitle}>Create Exercise Program</h2>
          <div className={styles.courseCreatorActions}>
            <button
              onClick={() => setPreviewMode(true)}
              className={`${styles.btn} ${styles.btnPreview}`}
            >
              <Eye size={18} />
              Preview
            </button>
            <button
              onClick={handleSaveProgram}
              disabled={saveStatus === 'saving'}
              className={`${styles.btn} ${styles.btnPrimary} ${saveStatus === 'success' ? styles.btnSuccess :
                saveStatus === 'error' ? styles.btnError : ''
                }`}
            >
              {saveStatus === 'saving' ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                <Save size={18} />
              )}
              {saveStatus === 'saving' ? 'Saving...' :
                saveStatus === 'success' ? 'Saved!' :
                  saveStatus === 'error' ? 'Error!' : 'Save Program'}
            </button>
          </div>
        </div>

        {/* Program Selection Section */}
        <div className={styles.programSelectionSection}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Load Existing Program</label>
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className={styles.formSelect}
                disabled={isLoading}
              >
                <option value="">Select a program to edit...</option>
                {existingPrograms.map(prog => (
                  <option key={prog.id} value={prog.id}>
                    {prog.title} ({new Date(prog.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.programSelectionActions}>
              <button
                onClick={loadSelectedProgram}
                disabled={!selectedProgramId || isLoading}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                {isLoading ? <Loader2 className={styles.spinner} size={16} /> : null}
                Load Program
              </button>
              <button
                onClick={createNewProgram}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                New Program
              </button>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Program Title</label>
          <input
            type="text"
            value={program.title}
            onChange={(e) => setProgram(prev => ({ ...prev, title: e.target.value }))}
            className={styles.formInput}
            placeholder="Enter program title..."
          />
        </div>

        <div className={styles.coursesSection}>
          {program.courses!.map((course, courseIndex) => (
            <div key={course.id} className={styles.courseCard}>
              <div
                className={styles.courseCardHeader}
                onClick={() => toggleCourseExpansion(course.id)}
              >
                <div className={styles.courseCardInfo}>
                  <span className={styles.courseCardNumber}>#{courseIndex + 1}</span>
                  <h3 className={styles.courseCardTitle}>
                    {course.title || `Course ${courseIndex + 1}`}
                  </h3>
                  <span className={styles.courseCardMeta}>
                    ({course.videos.length} videos)
                  </span>
                </div>
                <div className={styles.courseCardActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCourse(course.id);
                    }}
                    className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                  >
                    <Trash2 size={18} />
                  </button>
                  {expandedCourses.has(course.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedCourses.has(course.id) && (
                <div className={styles.courseCardContent}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={`${styles.formLabel} ${styles.formLabelDanger}`}>Disclaimer</label>
                      <textarea
                        value={course.disclaimer}
                        onChange={(e) => updateCourse(course.id, 'disclaimer', e.target.value)}
                        className={`${styles.formTextarea} ${styles.formTextareaDanger}`}
                        rows={3}
                        placeholder="Enter safety disclaimer..."
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={`${styles.formLabel} ${styles.formLabelInfo}`}>Notes</label>
                      <textarea
                        value={course.notes}
                        onChange={(e) => updateCourse(course.id, 'notes', e.target.value)}
                        className={`${styles.formTextarea} ${styles.formTextareaInfo}`}
                        rows={3}
                        placeholder="Enter additional notes..."
                      />
                    </div>
                  </div>

                  <div className={styles.optionsSection}>
                    <div className={styles.sectionHeader}>
                      <label className={styles.formLabel}>Options</label>
                      <button
                        onClick={() => addOption(course.id)}
                        className={`${styles.btn} ${styles.btnSmall} ${styles.btnSecondary}`}
                      >
                        <Plus size={16} />
                        Add Option
                      </button>
                    </div>
                    <div className={styles.optionsList}>
                      {course.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={styles.optionItem}>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(course.id, optionIndex, e.target.value)}
                            className={styles.formInput}
                            placeholder={`Option ${optionIndex + 1}...`}
                          />
                          <button
                            onClick={() => deleteOption(course.id, optionIndex)}
                            className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.videosSection}>
                    <div className={styles.sectionHeader}>
                      <h4 className={styles.sectionTitle}>Exercise Videos</h4>
                      <button
                        onClick={() => addVideo(course.id)}
                        className={`${styles.btn} ${styles.btnSecondary}`}
                      >
                        <Plus size={18} />
                        Add Video
                      </button>
                    </div>

                    <div className={styles.videosList}>
                      {course.videos.map((video, videoIndex) => (
                        <div key={video.id} className={styles.videoCard}>
                          <div className={styles.videoCardHeader}>
                            <span className={styles.videoCardNumber}>Video #{videoIndex + 1}</span>
                            <button
                              onClick={() => deleteVideo(course.id, video.id)}
                              className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className={styles.formRow}>
                            <input
                              type="text"
                              value={video.title}
                              onChange={(e) => updateVideo(course.id, video.id, 'title', e.target.value)}
                              className={styles.formInput}
                              placeholder="Video title..."
                            />
                            <select
                              value={video.difficulty}
                              onChange={(e) => updateVideo(course.id, video.id, 'difficulty', e.target.value)}
                              className={styles.formSelect}
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                          </div>

                          <div className={styles.formRow}>
                            <input
                              type="text"
                              value={video.duration}
                              onChange={(e) => updateVideo(course.id, video.id, 'duration', e.target.value)}
                              className={styles.formInput}
                              placeholder="Duration (e.g., 5:30)..."
                            />
                            <div className={styles.uploadSection}>
                              <input
                                type="text"
                                placeholder='Video url'
                                onChange={(e) => updateVideo(course.id, video.id, 'videoUrl', e.target.value)}
                                className={styles.formInput}
                                id={`video-${video.id}`}
                                value={video.videoUrl}
                              />
                              {video.videoUrl && (
                                <span className={styles.uploadStatus}>✓ Uploaded</span>
                              )}
                            </div>
                          </div>

                          <textarea
                            value={video.description}
                            onChange={(e) => updateVideo(course.id, video.id, 'description', e.target.value)}
                            className={styles.formTextarea}
                            rows={2}
                            placeholder="Video description..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addCourse}
          className={`${styles.btn} ${styles.btnAddCourse}`}
        >
          <Plus size={20} />
          Add New Course
        </button>
      </div>
    </div>
  );
};

export default CourseCreator;