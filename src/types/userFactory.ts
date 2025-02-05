import { Student, Teacher, User } from './user';

export class UserFactory {
  static createUser(userData: any): User {
    const baseUser = {
      email: userData.email,
      uid: userData.uid,
      createdAt: userData.createdAt,
      nickname: userData.nickname,
    };

    if (userData.type === 'student') {
      return {
        ...baseUser,
        type: 'student',
        balance: userData.balance ?? 0,
        interests: userData.interests ?? [],
        goals: userData.goals ?? [],
        bookingHistory: userData.bookingHistory ?? [],
        academicDetails: {
          gradeLevel: userData.academicDetails?.gradeLevel ?? '',
          description: userData.academicDetails?.description ?? '',
        },
      } as Student;
    } else {
      return {
        ...baseUser,
        type: 'teacher',
        description: userData.description ?? '',
        availability: userData.availability ?? [],
        pricing: userData.pricing ?? 0,
        expertise: userData.expertise ?? '',
        education: userData.education ?? '',
        experience: userData.experience ?? '',
        teachingStyle: userData.teachingStyle ?? '',
      } as Teacher;
    }
  }

  static createNewStudent(
    email: string,
    uid: string,
    nickname: string
  ): Student {
    return {
      email,
      uid,
      createdAt: new Date().toISOString(),
      type: 'student',
      nickname,
      balance: 0,
      interests: [],
      goals: [],
      bookingHistory: [],
      academicDetails: {
        gradeLevel: '',
        description: '',
      },
    };
  }

  static createNewTeacher(
    email: string,
    uid: string,
    nickname: string,
    description: string
  ): Teacher {
    return {
      email,
      uid,
      createdAt: new Date().toISOString(),
      type: 'teacher',
      nickname,
      description,
      availability: [],
      pricing: 0,
      expertise: '',
      education: '',
      experience: '',
      teachingStyle: '',
    };
  }
} 