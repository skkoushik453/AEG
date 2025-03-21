from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from textstat import flesch_reading_ease
import language_tool_python
import numpy as np

app = Flask(__name__)
CORS(app)

# Initialize NLTK resources
for resource in ['punkt', 'averaged_perceptron_tagger', 'stopwords']:
    try:
        nltk.data.find(f'tokenizers/{resource}')
    except LookupError:
        nltk.download(resource)

# Initialize grammar checker
try:
    tool = language_tool_python.LanguageTool('en-US', config={})
except Exception as e:
    print(f"Grammar checker initialization failed: {e}")
    tool = None

def extract_features(essay_text):
    try:
        sentences = sent_tokenize(essay_text)
        words = word_tokenize(essay_text)
        stop_words = set(stopwords.words('english'))
        filtered_words = [w.lower() for w in words if w.isalpha() and w.lower() not in stop_words]

        sentence_count = len(sentences)
        word_count = len(filtered_words)
        avg_sentence_length = word_count / sentence_count if sentence_count else 0
        readability_score = flesch_reading_ease(essay_text)

        grammar_errors = len(tool.check(essay_text)) if tool else 0
        unique_words = len(set(filtered_words))
        lexical_diversity = unique_words / word_count if word_count else 0

        return [sentence_count, word_count, avg_sentence_length, readability_score, grammar_errors, lexical_diversity]
    except Exception as e:
        raise RuntimeError(f"Feature extraction failed: {e}")

def calculate_score(features):
    try:
        readability_weight = 0.4
        grammar_weight = 0.3
        diversity_weight = 0.3

        readability_score = min(100, max(0, features[3]))
        grammar_score = max(0, 100 - (features[4] * 10))
        diversity_score = features[5] * 100

        total_score = (
            readability_score * readability_weight +
            grammar_score * grammar_weight +
            diversity_score * diversity_weight
        )
        grade = min(10, max(1, total_score / 10))
        return round(grade, 1), round(total_score, 1)
    except Exception as e:
        raise RuntimeError(f"Score calculation failed: {e}")

def generate_feedback(features):
    feedback = []
    if features[1] < 20:
        feedback.append("Essay is too short and lacks sufficient content for evaluation.")
    elif features[1] < 50:
        feedback.append("Essay is relatively short, consider adding more content.")
    if features[2] < 10:
        feedback.append("Essay lacks sentence structure and complexity.")
    if features[4] > 5:
        feedback.append(f"Found {features[4]} grammar errors, consider revising.")
    if features[5] < 0.5:
        feedback.append("Try using more varied vocabulary.")
    return " ".join(feedback) if feedback else "Good essay! Well structured and well written."

@app.route('/grade-essay', methods=['POST'])
def grade_essay():
    try:
        data = request.get_json()
        essay_text = data.get('essay_text', '').strip()

        if not essay_text:
            return jsonify({'error': 'No valid essay text provided'}), 400

        features = extract_features(essay_text)
        grade, percentage = calculate_score(features)
        feedback = generate_feedback(features)

        return jsonify({
            "grade": grade,
            "percentage": percentage,
            "feedback": feedback,
            "grammar_errors": features[4],
            "vocabulary_diversity": round(features[5], 2),
            "readability_score": round(features[3], 1)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
