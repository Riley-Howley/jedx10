// CourseManagement.tsx
import React, { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import {
  saveProgram,
  loadProgram,
  getAllPrograms,
  type Program,
  type ExerciseVideo,
  type Course,
  deleteProgram,
  deleteVideo
} from '../supabaseHelpers';
import { v4 as uuidv4 } from 'uuid';

import styles from './courseManagementNew.module.css';

const generateId = () => uuidv4();

const CourseManagement: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [existingPrograms, setExistingPrograms] = useState<Program[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadExistingPrograms();
  }, []);

  const loadExistingPrograms = async () => {
    setIsLoading(true);
    try {
      const programs = await getAllPrograms();
      console.log("Programs", programs);
      setExistingPrograms(programs);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter programs (simple text match)
  const filteredPrograms = existingPrograms.filter(program => {
    const matchesSearch =
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (program.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // const getProgramStats = (program: Program) => {
  //   const allVideos = program.courses.flatMap(c => c.videos ?? []);

  //   const totalDurationSeconds = allVideos.reduce((acc, v) => {
  //     if (!v?.duration) return acc;
  //     const parts = v.duration.split(':').map(p => Number(p));
  //     if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
  //       return acc + parts[0] * 60 + parts[1];
  //     }
  //     // if it's a single number (minutes)
  //     const n = Number(v.duration);
  //     if (!isNaN(n)) return acc + n * 60;
  //     return acc;
  //   }, 0);

  //   const totalDuration = `${Math.floor(totalDurationSeconds / 60)}:${(
  //     totalDurationSeconds % 60
  //   )
  //     .toString()
  //     .padStart(2, '0')}`;

  //   const enrolledCount = Math.floor(Math.random() * 500) + 1;

  //   const diffRank: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };
  //   const difficulty =
  //     allVideos.length > 0
  //       ? allVideos.reduce((acc, v) => (diffRank[v.difficulty] > diffRank[acc] ? v.difficulty : acc), 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced')
  //       : 'Beginner';

  //   return {
  //     difficulty: difficulty.toLowerCase(),
  //     totalDuration,
  //     enrolledCount
  //   };
  // };

  // --- Program / Course CRUD helpers ---

  const handleEditProgram = async (programId: string) => {
    setIsLoading(true);
    try {
      const program = await loadProgram(programId);
      setSelectedProgram(program);
      // default selectedCourse to first course if available
      setSelectedCourse(program!.courses && program!.courses.length > 0 ? program!.courses[0] : null);
      setIsEditing(true);
    } catch (err) {
      console.error('Error loading program for edit:', err);
      alert('Failed to load program for editing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new course: if currently editing a program, append a course to it.
  // Otherwise create a new program with a single course.
  const handleCreateNewCourse = () => {
    const newCourse: Course = {
      id: generateId(),
      title: 'New Course',
      description: '',
      disclaimer: '',
      notes: '',
      options: [],
      videos: []
    };

    if (selectedProgram) {
      // add to currently editing program
      const updatedProgram: Program = {
        ...selectedProgram,
        courses: [...selectedProgram.courses!!, newCourse]
      };
      setSelectedProgram(updatedProgram);
      setSelectedCourse(newCourse);
    } else {
      // create a new program wrapping this course
      const newProgram: Program = {
        id: generateId(),
        title: 'New Program',
        description: '',
        courses: [newCourse]
      };
      setSelectedProgram(newProgram);
      setSelectedCourse(newCourse);
      setIsEditing(true);
    }
  };

  const handleBackToCourseList = () => {
    setSelectedCourse(null);
    setSelectedProgram(null);
    setIsEditing(false);
  };

  // Save the whole program (new or updated)
  const handleSaveProgram = async () => {
    if (!selectedProgram) return;
    setSaveStatus('saving');
    try {
      console.log("SelectedProgram", selectedProgram)
      const result = await saveProgram(selectedProgram);

      if (result.success) {
        setSaveStatus('success');
        await loadExistingPrograms();
        // keep editing so user can continue; but update selectedProgram id if saved new record returned id (optional)
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        alert(`Error saving program: ${result.error}`);
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving program:', error);
      alert('An unexpected error occurred while saving');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Add video to selectedCourse
  const handleAddVideo = () => {
    if (!selectedCourse || !selectedProgram) {
      // nothing to attach to — create a new course then add a video
      handleCreateNewCourse();
      return;
    }

    const newVideo: ExerciseVideo = {
      id: generateId(),
      title: 'New Exercise Video',
      duration: '0:00',
      videoUrl: '',
      description: '',
      order: selectedCourse.videos?.length ?? 0
    };

    const updatedCourse: Course = {
      ...selectedCourse,
      videos: [...(selectedCourse.videos || []), newVideo]
    };

    const updatedProgram: Program = {
      ...selectedProgram,
      courses: selectedProgram.courses!.map(c => (c.id === updatedCourse.id ? updatedCourse : c))
    };

    setSelectedCourse(updatedCourse);
    setSelectedProgram(updatedProgram);
  };

  const handleUpdateVideo = (videoId: string, updates: Partial<ExerciseVideo>) => {
    if (!selectedCourse || !selectedProgram) return;

    const updatedCourse: Course = {
      ...selectedCourse,
      videos: selectedCourse.videos.map(v => (v.id === videoId ? { ...v, ...updates } : v))
    };

    const updatedProgram: Program = {
      ...selectedProgram,
      courses: selectedProgram.courses!.map(c => (c.id === updatedCourse.id ? updatedCourse : c))
    };

    setSelectedCourse(updatedCourse);
    setSelectedProgram(updatedProgram);
  };

  const handleDeleteVideo = (videoId: string) => {
    if (!selectedCourse || !selectedProgram) return;

    const updatedCourse: Course = {
      ...selectedCourse,
      videos: selectedCourse.videos.filter(v => v.id !== videoId)
    };


    const updatedProgram: Program = {
      ...selectedProgram,
      courses: selectedProgram.courses!.map(c => (c.id === updatedCourse.id ? updatedCourse : c))
    };

    deleteVideo(videoId)
    setSelectedCourse(updatedCourse);
    setSelectedProgram(updatedProgram);
  };

  // Update a course's basic fields (title, description, etc.) while keeping program in sync
  const handleUpdateCourseFields = (updates: Partial<Course>) => {
    if (!selectedCourse || !selectedProgram) return;

    const updatedCourse: Course = { ...selectedCourse, ...updates };

    const updatedProgram: Program = {
      ...selectedProgram,
      courses: selectedProgram.courses!.map(c => (c.id === updatedCourse.id ? updatedCourse : c))
    };

    setSelectedCourse(updatedCourse);
    setSelectedProgram(updatedProgram);
  };

  // TODO: Figure out if this is needed and renable but for now this isnt doing anything anymore so deprecated logic
  // When user deletes a course from the program list (not while editing), remove it and save program
  // const handleDeleteCourse = async (courseId: string) => {
  //   // If editing this program and deleting from editor:
  //   if (selectedProgram) {
  //     if (!selectedProgram.courses!.find(c => c.id === courseId)) return;
  //     // confirm
  //     if (!confirm('Are you sure you want to delete this course from the program?')) return;

  //     const updatedProgram: Program = {
  //       ...selectedProgram,
  //       courses: selectedProgram.courses!.filter(c => c.id !== courseId)
  //     };

  //     setSelectedProgram(updatedProgram);
  //     // if we deleted the currently selectedCourse, clear it or pick another
  //     if (selectedCourse?.id === courseId) {
  //       setSelectedCourse(updatedProgram.courses!.length > 0 ? updatedProgram.courses![0] : null);
  //     }

  //     // persist change
  //     try {
  //       const result = await saveProgram(updatedProgram);
  //       if (result.success) {
  //         await loadExistingPrograms();
  //       } else {
  //         console.error('Failed to save program after deleting course', result.error);
  //       }
  //     } catch (err) {
  //       console.error('Error saving program after deleting course:', err);
  //     }
  //     setActiveDropdown(null);
  //     return;
  //   }

  //   // Otherwise, find program in existingPrograms and remove course, then save program
  //   let foundProgram: Program | undefined;
  //   existingPrograms.forEach(program => {
  //     if (program.courses!.some(c => c.id === courseId)) foundProgram = program;
  //   });

  //   if (!foundProgram) {
  //     console.warn('Course not found in any program');
  //     setActiveDropdown(null);
  //     return;
  //   }

  //   if (!confirm('Are you sure you want to delete this course?')) {
  //     setActiveDropdown(null);
  //     return;
  //   }

  //   const updatedProgram = { ...foundProgram, courses: foundProgram.courses!.filter(c => c.id !== courseId) };

  //   try {
  //     const result = await saveProgram(updatedProgram);
  //     if (result.success) {
  //       await loadExistingPrograms();
  //     } else {
  //       console.error('Error deleting course:', result.error);
  //     }
  //   } catch (error) {
  //     console.error('Error deleting course:', error);
  //   }
  //   setActiveDropdown(null);
  // };

  // // Duplicate a course (program-level). Creates new ids for course + videos.
  // const handleDuplicateCourse = async (programId: string, courseId: string) => {
  //   const program = existingPrograms.find(p => p.id === programId);
  //   if (!program) return;

  //   const original = program.courses!.find(c => c.id === courseId);
  //   if (!original) return;

  //   const duplicated: Course = {
  //     ...JSON.parse(JSON.stringify(original)),
  //     id: generateId(),
  //     title: `${original.title} (Copy)`,
  //     videos: (original.videos || []).map(v => ({ ...v, id: generateId() }))
  //   };

  //   const updatedProgram: Program = {
  //     ...program,
  //     courses: [...program.courses!, duplicated]
  //   };

  //   try {
  //     const result = await saveProgram(updatedProgram);
  //     if (result.success) {
  //       await loadExistingPrograms();
  //     } else {
  //       console.error('Error duplicating course:', result.error);
  //     }
  //   } catch (err) {
  //     console.error('Error duplicating course:', err);
  //   }
  //   setActiveDropdown(null);
  // };

  const toggleDropdown = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ------------- RENDER --------------
  if (isEditing && selectedProgram) {
    return (
      <div className={styles.container}>
        {/* Editor Header */}
        <div className={styles.editorHeader}>
          <div className={styles.editorTitle}>
            <button className={styles.backBtn} onClick={handleBackToCourseList}>
              ←
            </button>
            <h2 style={{ background: 'transparent' }}>Edit Program</h2>
          </div>
          <div className={styles.headerActions}>
            <button
              className={`${styles.btn} ${styles.btnSuccess} ${saveStatus === 'success' ? styles.btnSuccessActive : saveStatus === 'error' ? styles.btnError : ''}`}
              onClick={handleSaveProgram}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                <Save size={18} />
              )}
              {saveStatus === 'saving' ? 'Saving...' :
                saveStatus === 'success' ? 'Saved!' :
                  saveStatus === 'error' ? 'Error!' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Program Info Section */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2 style={{ background: 'transparent' }} className={styles.sectionTitle}>Program Information</h2>
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>Program Title</label>
            <input
              type="text"
              className={styles.inlineEdit}
              value={selectedProgram.title}
              onChange={(e) => setSelectedProgram({ ...selectedProgram, title: e.target.value })}
              placeholder="Enter program title"
            />
          </div>
        </div>

        {/* Course Info Section */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2 style={{ background: 'transparent' }} className={styles.sectionTitle}>Course Information</h2>
            <div style={{ marginLeft: 'auto' }}>
              {/* quick course switcher */}
              <select
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const cid = e.target.value;
                  const c = selectedProgram.courses!.find(x => x.id === cid) || null;
                  setSelectedCourse(c);
                }}
              >
                {selectedProgram.courses!.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title || 'Untitled Course'}
                  </option>
                ))}
              </select>
              <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} style={{ marginLeft: 8 }} onClick={handleCreateNewCourse}>
                <Plus size={12} /> Add Course
              </button>
            </div>
          </div>

          {selectedCourse ? (
            <>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Course Title</label>
                <input
                  type="text"
                  className={styles.inlineEdit}
                  value={selectedCourse.title}
                  onChange={(e) => handleUpdateCourseFields({ title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formControl}
                  rows={3}
                  value={selectedCourse.description}
                  onChange={(e) => handleUpdateCourseFields({ description: e.target.value })}
                  placeholder="Brief description of the course..."
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Disclaimer</label>
                <textarea
                  className={styles.formControl}
                  rows={3}
                  value={selectedCourse.disclaimer}
                  onChange={(e) => handleUpdateCourseFields({ disclaimer: e.target.value })}
                  placeholder="Safety disclaimer..."
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Notes</label>
                <textarea
                  className={styles.formControl}
                  rows={3}
                  value={selectedCourse.notes}
                  onChange={(e) => handleUpdateCourseFields({ notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </>
          ) : (
            <div style={{ padding: 12, color: '#718096' }}>No course selected. Add a course to start editing.</div>
          )}
        </div>

        {/* Videos Section */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2 style={{ background: 'transparent' }} className={styles.sectionTitle}>
              Exercise Videos ({selectedCourse ? (selectedCourse.videos?.length ?? 0) : 0})
            </h2>
            <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={handleAddVideo}>
              <Plus size={16} />
              Add Video
            </button>
          </div>

          <div className={styles.videoList}>
            {/* render courses and their videos */}
            {selectedProgram.courses!.map((course) => (
              <div key={course.id} className={styles.videoItem}>
                {course.videos?.map((video, videoIndex) => (
                  <div key={video.id} className={styles.videoWrapper}>
                    <div className={styles.videoHeader}>
                      <span className={styles.dragHandle}>⋮⋮</span>
                      <span className={styles.videoNumber}>{videoIndex + 1}</span>
                      <div className={styles.quickActions}>
                        <button
                          className={styles.iconBtn}
                          title="Delete"
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className={styles.videoContent}>
                        <input
                          type="text"
                          className={`${styles.inlineEdit} ${styles.videoTitle}`}
                          value={video.title}
                          onChange={(e) => handleUpdateVideo(video.id, { title: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className={styles.videoMeta}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Duration</span>
                        <input
                          type="text"
                          className={styles.formControl}
                          value={video.duration}
                          onChange={(e) => handleUpdateVideo(video.id, { duration: e.target.value })}
                          style={{ width: '80px', padding: '4px 8px', fontSize: '12px' }}
                        />
                      </div>
                    </div>

                    <div className={styles.videoUrl}>
                      <input
                        type="url"
                        className={`${styles.formControl} ${styles.urlInput}`}
                        value={video.videoUrl || ''}
                        onChange={(e) => handleUpdateVideo(video.id, { videoUrl: e.target.value })}
                        placeholder="Video URL"
                      />
                      <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                        Validate
                      </button>
                    </div>

                    <textarea
                      className={`${styles.formControl} ${styles.videoDescription}`}
                      style={{ width: "90%" }}
                      value={video.description}
                      onChange={(e) => handleUpdateVideo(video.id, { description: e.target.value })}
                      placeholder="Video description..."
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* Add New Video (UI quick action) */}
            <div className={styles.addVideo} onClick={handleAddVideo}>
              <div className={styles.addVideoIcon}>+</div>
              <div style={{ color: '#a0aec0', fontWeight: '500' }}>Add New Exercise Video</div>
              <div style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
                Click to add another video to this course
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Main list view ----
  return (
    <div className={styles.container}>
      {/* Course Selection Section */}
      <div className={styles.courseSelection}>
        <div className={styles.selectionHeader}>
          <h2 style={{ background: "transparent" }} className={styles.sectionTitle}>Select Program to Edit</h2>
        </div>

        {/* Search and Filter */}
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="program">Programs</option>
            <option value="course">Courses (soon)</option>
            <option value="challenge">Challenges (soon)</option>
          </select>
          <select
            className={styles.filterSelect}
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Levels (soon)</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <Loader2 className={styles.spinner} size={24} />
            Loading programs...
          </div>
        ) : (
          /* Course Grid */
          <div className={styles.courseGrid}>
            {/* Create New Course Card */}
            <div className={`${styles.courseCard} ${styles.newCourseCard}`} onClick={handleCreateNewCourse}>
              <div className={styles.newCourseIcon}>+</div>
              <div style={{ color: '#a0aec0', fontWeight: '600', marginBottom: '4px' }}>
                Create New Program
              </div>
              <div style={{ color: '#718096', fontSize: '12px' }}>
                Start building a new fitness program
              </div>
            </div>

            {/* Existing Program Cards */}
            {filteredPrograms.map(program => {
              // const stats = getProgramStats(program);
              return (
                <div
                  key={program.id}
                  className={styles.courseCard}
                  onClick={() => handleEditProgram(program.id!)}
                >
                  <div className={styles.courseActions}>
                    <div className={`${styles.dropdown} ${activeDropdown === program.id ? styles.active : ''}`}>
                      <button
                        className={styles.dropdownBtn}
                        onClick={(e) => toggleDropdown(program.id!, e)}
                      >
                        ⋮
                      </button>
                      {activeDropdown === program.id && (
                        <div className={styles.dropdownContent} onClick={(e) => e.stopPropagation()}>
                          <div
                            className={styles.dropdownItem}
                            onClick={() => {
                              // delete entire program (confirm)
                              if (!confirm('Delete this program?')) return;
                              saveProgram({ ...program, courses: program.courses }).then(() => loadExistingPrograms()).catch(console.error);
                              deleteProgram(program.id!);
                            }}
                            style={{ color: '#e53e3e' }}
                          >
                            🗑 Delete Program
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.courseCardHeader}>
                    <div>
                      <div className={styles.courseTitle}>{program.title}</div>
                      <div className={styles.courseMeta}>
                        {/* Active: {String((program as any).is_active ?? true)} • {stats.totalDuration} • {stats.enrolledCount} enrolled */}
                      </div>
                    </div>
                  </div>

                  <div className={styles.courseDescription}>{program.description}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
