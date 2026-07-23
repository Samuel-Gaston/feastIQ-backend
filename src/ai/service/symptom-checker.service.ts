import { Injectable } from '@nestjs/common';

type UrgencyLevel = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

const RED_FLAG_KEYWORDS = [
  'chest pain', 'difficulty breathing', 'can\'t breathe', 'severe bleeding',
  'unconscious', 'stroke', 'numbness on one side', 'severe head injury',
  'suicidal', 'coughing blood', 'severe allergic reaction',
];

const SYMPTOM_MAP: { keywords: string[]; specialization: string; urgency: UrgencyLevel }[] = [
  { keywords: ['chest pain', 'palpitations', 'irregular heartbeat', 'high blood pressure'], specialization: 'Cardiology', urgency: 'URGENT' },
  { keywords: ['cough', 'shortness of breath', 'wheezing', 'asthma'], specialization: 'Pulmonology', urgency: 'URGENT' },
  { keywords: ['headache', 'migraine', 'dizziness', 'numbness', 'seizure', 'memory loss'], specialization: 'Neurology', urgency: 'URGENT' },
  { keywords: ['stomach pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating'], specialization: 'Gastroenterology', urgency: 'ROUTINE' },
  { keywords: ['rash', 'itching', 'skin', 'acne', 'eczema'], specialization: 'Dermatology', urgency: 'ROUTINE' },
  { keywords: ['joint pain', 'back pain', 'fracture', 'sprain', 'swelling in leg'], specialization: 'Orthopedics', urgency: 'ROUTINE' },
  { keywords: ['anxiety', 'depression', 'stress', 'insomnia', 'panic'], specialization: 'Psychiatry', urgency: 'ROUTINE' },
  { keywords: ['ear pain', 'sore throat', 'sinus', 'hearing loss', 'nasal congestion'], specialization: 'ENT', urgency: 'ROUTINE' },
  { keywords: ['fever', 'child', 'infant', 'baby'], specialization: 'Pediatrics', urgency: 'URGENT' },
  { keywords: ['fatigue', 'tired', 'weight loss', 'weight gain', 'thirst'], specialization: 'General Practice', urgency: 'ROUTINE' },
];

@Injectable()
export class SymptomCheckerService {
  analyze(symptomText: string) {
    const text = symptomText.toLowerCase();

    const isEmergency = RED_FLAG_KEYWORDS.some(flag => text.includes(flag));

    const scores = SYMPTOM_MAP.map(entry => ({
      ...entry,
      score: entry.keywords.filter(k => text.includes(k)).length,
    })).filter(e => e.score > 0);

    scores.sort((a, b) => b.score - a.score);

    const topMatch = scores[0];

    return {
      specialization: topMatch?.specialization || 'General Practice',
      urgency: isEmergency ? 'EMERGENCY' : (topMatch?.urgency || 'ROUTINE'),
      matchedSymptoms: scores.map(s => s.specialization),
      suggestedConsultationType: isEmergency ? 'In_Person_At_Hospital' : 'Chat',
      disclaimer: 'This is an automated suggestion based on keyword matching, not a medical diagnosis. Always consult a qualified doctor.',
    };
  }
}