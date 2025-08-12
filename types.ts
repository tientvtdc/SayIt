export interface WordIpaPair {
  word: string;
  ipa: string;
}

export interface PronunciationAnalysis {
  goodPoints: string[];
  areasForImprovement: {
    word: string;
    feedback: string;
  }[];
}

export interface Sentence {
    text: string;
    meaning: string;
}

export interface Topic {
    name: string;
    sentences: Sentence[];
}
