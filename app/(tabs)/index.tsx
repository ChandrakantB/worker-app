import React, { useState } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Dimensions, 
  Vibration, 
  Linking, 
  Modal 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkerData } from '../../contexts/worker/WorkerDataContext';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { SOSService } from '../../services/emergency/SOSService';
import CustomHeader from '../../components/navigation/CustomHeader';
import { router } from 'expo-router';
import {
  MapPin, 
  Route, 
  Siren, 
  Play, 
  ChevronRight, 
  BarChart3, 
  ClipboardList,
  AlertCircle, 
  CheckCircle2, 
  Youtube, 
  Book, 
  ListTodo, 
  Star, 
  Clock,
  X,
  ExternalLink,
  GraduationCap,
  Shield,
  BookOpen,
  Award
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Real Government Training Videos (same as Profile)
const GOVERNMENT_TRAINING_MODULES = [
  {
    id: 1,
    title: 'Swachh Bharat Mission Training',
    description: 'Official training module on Swachh Bharat Mission Gramin',
    duration: '45 mins',
    level: 'Beginner',
    provider: 'Govt of India',
    youtubeUrl: 'https://www.youtube.com/watch?v=j-DcClEvwfo',
    thumbnailColor: '#3b82f6',
    icon: GraduationCap
  },
  {
    id: 2,
    title: 'Municipal Solid Waste Management',
    description: 'NPTEL IIT Guwahati comprehensive course on waste management',
    duration: '52 mins',
    level: 'Intermediate',
    provider: 'NPTEL IIT Guwahati',
    youtubeUrl: 'https://www.youtube.com/watch?v=IBlFQgBX5ZQ',
    thumbnailColor: '#10b981',
    icon: BookOpen
  },
  {
    id: 3,
    title: 'Solid Waste Management Rules 2016',
    description: 'Understanding India\'s Waste Management Rules by CSE',
    duration: '2+ hours',
    level: 'Advanced',
    provider: 'Centre for Science and Environment',
    youtubeUrl: 'https://www.youtube.com/@SolidWasteMOOC',
    thumbnailColor: '#f59e0b',
    icon: Shield
  },
  {
    id: 4,
    title: 'Waste Management Safety Training',
    description: 'Safety protocols for waste collection and handling',
    duration: '35 mins',
    level: 'Essential',
    provider: 'Safety Training Institute',
    youtubeUrl: 'https://www.youtube.com/watch?v=cqJ-ZM4UZNk',
    thumbnailColor: '#dc2626',
    icon: Shield
  },
  {
    id: 5,
    title: 'India\'s Solid Waste Strategy',
    description: 'National strategy for self-reliant waste management',
    duration: '25 mins',
    level: 'Policy',
    provider: 'Science for Self-Reliant India',
    youtubeUrl: 'https://www.youtube.com/watch?v=F2RdvQsFRPk',
    thumbnailColor: '#10b981',
    icon: BarChart3
  },
  {
    id: 6,
    title: 'iGOT Karmayogi Swachhata Module',
    description: 'Official government e-learning module with certification',
    duration: '3-4 hours',
    level: 'Certification',
    provider: 'iGOT Karmayogi Platform',
    youtubeUrl: 'https://www.youtube.com/watch?v=5Q38AKJfs20',
    thumbnailColor: '#3b82f6',
    icon: Award
  }
];

const QUIZ_QUESTIONS = [
  {
    q: 'What color bin is meant for organic waste?',
    options: ['Blue', 'Green', 'Red', 'Yellow'],
    answer: 'Green'
  },
  {
    q: 'Which of these is hazardous waste?',
    options: ['Vegetable peels', 'Broken glass', 'Plastic bottles', 'Paper'],
    answer: 'Broken glass'
  },
  {
    q: 'How often should waste collection vehicles be cleaned?',
    options: ['Weekly', 'Daily', 'Monthly', 'When dirty'],
    answer: 'Daily'
  },
  {
    q: 'What PPE is essential for waste collection workers?',
    options: ['Gloves only', 'Mask only', 'Gloves, mask, boots', 'None required'],
    answer: 'Gloves, mask, boots'
  }
];

export default function DashboardScreen() {
  const { worker, assignedTasks, activeTask, completedTasks } = useWorkerData();
  const { theme } = useTheme();
  const { isOnline, syncStatus } = useOfflineSync();
  const insets = useSafeAreaInsets();
  
  const [sosLoading, setSosLoading] = useState(false);
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  // Navigation functions
  const goToMap = () => router.push('/map');
  const goToReports = () => router.push('/reports');
  const goToTasks = () => router.push('/tasks');

  const handleTrainingModulePress = async (module) => {
    try {
      await Linking.openURL(module.youtubeUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open training video. Please check your internet connection.');
    }
  };

  const handleSOS = () => {
    Vibration.vibrate([0, 100, 50, 100]);
    Alert.alert(
      '🚨 Emergency SOS',
      'Alert supervisors/emergency with your location.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send SOS', style: 'destructive', onPress: sendSOSAlert }
      ]
    );
  };

  const sendSOSAlert = async () => {
    if (!worker) return;
    setSosLoading(true);
    try {
      Vibration.vibrate([0, 200, 100, 200]);
      const success = await SOSService.sendEmergencyAlert(worker.id, worker.name, 'general');
      Alert.alert(
        success ? '✅ Sent' : '❌ Failed',
        success ? 'Help is on the way! Location shared.' : 'Alert failed. Try again or call 108.',
        [{ text: 'OK' }]
      );
    } finally {
      setSosLoading(false);
    }
  };

  const currentQuestion = QUIZ_QUESTIONS[quizStep] || null;
  
  const handleQuizAnswer = (selected: string) => {
    if (selected === currentQuestion.answer) setQuizScore(score => score + 1);
    setQuizStep(step => step + 1);
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizScore(0);
    setShowQuiz(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <CustomHeader
        title="Dashboard"
        subtitle={`Welcome back, ${worker?.name || 'Worker'}!`}
        showNotifications
        showSettings
        showConnectionStatus
      />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 65, 80) + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 20 }}>
          {/* Map/Area */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MapPin size={20} color={theme.colors.primary} />
              <Text style={{
                marginLeft: 12,
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.text
              }}>
                Route & Area Highlights
              </Text>
            </View>
            <Text style={{
              fontSize: 12,
              color: theme.colors.textSecondary,
              marginBottom: 12
            }}>
              See today's assigned route and area alerts.
            </Text>
            <TouchableOpacity
              onPress={goToMap}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              activeOpacity={0.8}
            >
              <Route size={18} color="white" />
              <Text style={{
                color: 'white',
                marginLeft: 8,
                fontWeight: 'bold'
              }}>
                Open Route & Map
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reports */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <ClipboardList size={20} color={theme.colors.warning} />
              <Text style={{
                marginLeft: 12,
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.text
              }}>
                Citizen Reports
              </Text>
            </View>
            <Text style={{
              fontSize: 12,
              color: theme.colors.textSecondary,
              marginBottom: 12
            }}>
              New improper segregation or illegal dumping reports in your area.
            </Text>
            <TouchableOpacity
              onPress={goToReports}
              style={{
                backgroundColor: theme.colors.warning,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              activeOpacity={0.8}
            >
              <AlertCircle size={18} color="white" />
              <Text style={{
                color: 'white',
                marginLeft: 8,
                fontWeight: 'bold'
              }}>
                Report Improper Segregation
              </Text>
            </TouchableOpacity>
          </View>

          {/* SOS */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Siren size={20} color={theme.colors.danger} />
              <Text style={{
                marginLeft: 12,
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.text
              }}>
                Emergency SOS
              </Text>
            </View>
            <Text style={{
              fontSize: 12,
              color: theme.colors.textSecondary,
              marginBottom: 12
            }}>
              In danger? Tap below to send emergency alert.
            </Text>
            <TouchableOpacity
              onPress={handleSOS}
              disabled={sosLoading}
              style={{
                backgroundColor: theme.colors.danger,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: sosLoading ? 0.6 : 1
              }}
              activeOpacity={0.8}
            >
              <Siren size={18} color="white" />
              <Text style={{
                color: 'white',
                marginLeft: 8,
                fontWeight: 'bold'
              }}>
                {sosLoading ? 'SENDING...' : 'Trigger SOS Now'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Duty & Shift */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Clock size={20} color={theme.colors.success} />
              <Text style={{
                marginLeft: 12,
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.text
              }}>
                Duty Status & Timings
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDutyModal(true)}
              style={{
                backgroundColor: theme.colors.success,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              activeOpacity={0.8}
            >
              <Clock size={18} color="white" />
              <Text style={{
                color: 'white',
                marginLeft: 8,
                fontWeight: 'bold'
              }}>
                View Weekly Duty/Route
              </Text>
            </TouchableOpacity>
          </View>

          {/* Training & Modules */}
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <GraduationCap size={20} color={theme.colors.secondary} />
              <Text style={{
                marginLeft: 12,
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.text
              }}>
                Government Training Videos
              </Text>
            </View>
            <Text style={{
              fontSize: 12,
              color: theme.colors.textSecondary,
              marginBottom: 16
            }}>
              Watch official government training modules or take a quick quiz.
            </Text>

            {/* Quick Access to Top 3 Training Videos */}
            <View style={{ marginBottom: 16 }}>
              {GOVERNMENT_TRAINING_MODULES.slice(0, 3).map(module => {
                const IconComponent = module.icon;
                return (
                  <TouchableOpacity
                    key={module.id}
                    onPress={() => handleTrainingModulePress(module)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: theme.colors.primary + '10',
                      borderWidth: 1,
                      borderColor: theme.colors.primary + '20'
                    }}
                    activeOpacity={0.8}
                  >
                    <IconComponent size={16} color={module.thumbnailColor} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{
                        color: theme.colors.text,
                        fontWeight: '600',
                        fontSize: 14
                      }}>
                        {module.title}
                      </Text>
                      <Text style={{
                        color: theme.colors.textSecondary,
                        fontSize: 11
                      }}>
                        {module.duration} • {module.level}
                      </Text>
                    </View>
                    <ExternalLink size={14} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* View All Training Button */}
            <TouchableOpacity
              onPress={() => setShowTrainingModal(true)}
              style={{
                backgroundColor: theme.colors.secondary,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
              activeOpacity={0.8}
            >
              <Youtube size={18} color="white" />
              <Text style={{
                color: 'white',
                marginLeft: 8,
                fontWeight: 'bold'
              }}>
                View All Training Videos
              </Text>
            </TouchableOpacity>

            {/* Quiz Section */}
            {!showQuiz ? (
              <TouchableOpacity
                onPress={() => { 
                  setShowQuiz(true); 
                  setQuizStep(0); 
                  setQuizScore(0); 
                }}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                activeOpacity={0.8}
              >
                <ListTodo size={18} color="white" />
                <Text style={{
                  color: 'white',
                  marginLeft: 8,
                  fontWeight: 'bold'
                }}>
                  Start Knowledge Quiz
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{
                backgroundColor: theme.colors.background,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}>
                {quizStep < QUIZ_QUESTIONS.length ? (
                  <>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16
                    }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: theme.colors.text
                      }}>
                        Question {quizStep + 1} of {QUIZ_QUESTIONS.length}
                      </Text>
                      <TouchableOpacity onPress={resetQuiz}>
                        <X size={20} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: theme.colors.text,
                      marginBottom: 16
                    }}>
                      {currentQuestion.q}
                    </Text>
                    {currentQuestion.options.map(option => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => handleQuizAnswer(option)}
                        style={{
                          marginBottom: 8,
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: theme.colors.secondary + '10',
                          borderWidth: 1,
                          borderColor: theme.colors.secondary + '20'
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={{
                          color: theme.colors.text,
                          fontWeight: '500'
                        }}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Star size={40} color={theme.colors.success} style={{ marginBottom: 16 }} />
                    <Text style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: theme.colors.success,
                      marginBottom: 8
                    }}>
                      Quiz Complete!
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      color: theme.colors.text,
                      marginBottom: 16
                    }}>
                      Score: {quizScore} / {QUIZ_QUESTIONS.length}
                    </Text>
                    <TouchableOpacity
                      onPress={resetQuiz}
                      style={{
                        backgroundColor: theme.colors.primary,
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 8
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={{
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        Take Again
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Training Modules Modal */}
      <Modal visible={showTrainingModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border
          }}>
            <TouchableOpacity onPress={() => setShowTrainingModal(false)}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.colors.text
            }}>
              Government Training Videos
            </Text>
            <View style={{ width: 20 }} />
          </View>
          
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              padding: 20, 
              paddingBottom: Math.max(insets.bottom + 20, 50) 
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: 20
            }}>
              Official Training Modules
            </Text>
            
            {GOVERNMENT_TRAINING_MODULES.map((module) => {
              const IconComponent = module.icon;
              
              return (
                <TouchableOpacity
                  key={module.id}
                  onPress={() => handleTrainingModulePress(module)}
                  style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 12
                  }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: module.thumbnailColor + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12
                    }}>
                      <IconComponent size={24} color={module.thumbnailColor} />
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.colors.text,
                        marginBottom: 4
                      }}>
                        {module.title}
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: theme.colors.textSecondary,
                        lineHeight: 18
                      }}>
                        {module.description}
                      </Text>
                    </View>
                    
                    <ExternalLink size={16} color={theme.colors.textSecondary} />
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Play size={14} color={theme.colors.textSecondary} />
                      <Text style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        marginLeft: 4,
                        marginRight: 12
                      }}>
                        {module.duration}
                      </Text>
                      
                      <View style={{
                        backgroundColor: module.thumbnailColor + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8
                      }}>
                        <Text style={{
                          fontSize: 10,
                          color: module.thumbnailColor,
                          fontWeight: '600'
                        }}>
                          {module.level}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={{
                      fontSize: 10,
                      color: theme.colors.textSecondary,
                      fontStyle: 'italic'
                    }}>
                      {module.provider}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            <View style={{
              backgroundColor: theme.colors.primary + '20',
              borderRadius: 12,
              padding: 16,
              marginTop: 20,
              borderWidth: 1,
              borderColor: theme.colors.primary + '40'
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <GraduationCap size={20} color={theme.colors.primary} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginLeft: 8
                }}>
                  Get Certified
                </Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                lineHeight: 16
              }}>
                Complete the iGOT Karmayogi modules to earn official government certification for waste management training.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Weekly Duty Modal */}
      <Modal visible={showDutyModal} animationType="slide" transparent>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '70%',
            padding: 20
          }}>
            <TouchableOpacity
              onPress={() => setShowDutyModal(false)}
              style={{
                alignSelf: 'flex-end',
                padding: 8,
                marginBottom: 8
              }}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
            
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 12,
              color: theme.colors.primary
            }}>
              Weekly Duty Timings & Routes
            </Text>
            
            <Text style={{
              fontWeight: 'bold',
              marginBottom: 16,
              color: theme.colors.text
            }}>
              Shift: 6:00 AM - 2:00 PM
            </Text>
            
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => (
              <View 
                key={day} 
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border
                }}
              >
                <Text style={{ 
                  color: theme.colors.text,
                  fontWeight: '500'
                }}>
                  {day}:
                </Text>
                <Text style={{ 
                  color: theme.colors.textSecondary 
                }}>
                  {['Sector 1', 'Sector 2', 'Sector 3, 4', 'Block A/B', 'Mall Road', 'Phases 1-2', 'Rest'][idx]}
                </Text>
              </View>
            ))}
            
            <Text style={{
              marginTop: 20,
              fontWeight: '500',
              color: theme.colors.textSecondary,
              fontSize: 12
            }}>
              Note: Sunday is usually for rest or backup/emergency routes.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
