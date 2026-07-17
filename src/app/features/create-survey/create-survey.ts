import { Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CreateSurveyData } from '../../shared/models/create-survey-data';

const FIRST_ANSWER_CHARACTER_CODE = 65;
const MIN_ANSWER_COUNT = 2;
const MIN_TITLE_LENGTH = 3;
const SURVEY_CATEGORIES = [
  'Team activities',
  'Gaming',
  'Health & Wellness',
  'Healthy Lifestyle',
] as const;

type AnswerControl = FormControl<string>;
type ClearableSurveyField = 'title' | 'endDate' | 'description';

type QuestionFormGroup = FormGroup<{
  question: FormControl<string>;
  allowMultipleAnswers: FormControl<boolean>;
  answers: FormArray<AnswerControl>;
}>;

@Component({
  selector: 'app-create-survey',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-survey.html',
  styleUrl: './create-survey.scss',
})
export class CreateSurvey {
  private readonly formBuilder = inject(FormBuilder);

  readonly isConfirmationVisible = signal(false);
  readonly publishedSurvey = signal<CreateSurveyData | null>(null);
  readonly categories = SURVEY_CATEGORIES;

  readonly surveyForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(MIN_TITLE_LENGTH)]],
    endDate: [''],
    category: ['', Validators.required],
    description: [''],
    questions: new FormArray<QuestionFormGroup>([this.createQuestionGroup()]),
  });

  /** Returns all question form groups. */
  get questions(): FormArray<QuestionFormGroup> {
    return this.surveyForm.controls.questions;
  }

  /** Returns the answers belonging to one question. */
  getAnswers(questionIndex: number): FormArray<AnswerControl> {
    return this.questions.at(questionIndex).controls.answers;
  }

  /** Returns an alphabetical label for an answer. */
  getAnswerLabel(answerIndex: number): string {
    return String.fromCharCode(FIRST_ANSWER_CHARACTER_CODE + answerIndex);
  }

  /** Clears one of the survey information fields. */
  clearSurveyField(field: ClearableSurveyField): void {
    this.surveyForm.controls[field].reset();
  }

  /** Adds a new question to the survey. */
  addQuestion(): void {
    this.questions.push(this.createQuestionGroup());
  }

  /** Clears the first question or removes any following question. */
  deleteQuestion(questionIndex: number): void {
    if (questionIndex === 0) {
      this.resetQuestion(questionIndex);
      return;
    }

    this.questions.removeAt(questionIndex);
  }

  /** Adds an answer to a selected question. */
  addAnswer(questionIndex: number): void {
    this.getAnswers(questionIndex).push(this.createAnswerControl());
  }

  /** Clears a required answer or removes an additional answer. */
  deleteAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.getAnswers(questionIndex);

    if (answers.length <= MIN_ANSWER_COUNT) {
      answers.at(answerIndex).reset();
      return;
    }

    answers.removeAt(answerIndex);
  }

  /** Validates the form and opens the confirmation overlay. */
  publishSurvey(): void {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }

    this.publishedSurvey.set(this.surveyForm.getRawValue());
    this.isConfirmationVisible.set(true);
  }

  /** Closes the publication confirmation overlay. */
  closeConfirmation(): void {
    this.isConfirmationVisible.set(false);
  }

  /** Creates a question with two required answer fields. */
  private createQuestionGroup(): QuestionFormGroup {
    return this.formBuilder.nonNullable.group({
      question: ['', Validators.required],
      allowMultipleAnswers: [false],
      answers: new FormArray<AnswerControl>([
        this.createAnswerControl(),
        this.createAnswerControl(),
      ]),
    });
  }

  /** Creates one required answer control. */
  private createAnswerControl(): AnswerControl {
    return this.formBuilder.nonNullable.control('', Validators.required);
  }

  /** Restores one question to its initial state. */
  private resetQuestion(questionIndex: number): void {
    const question = this.questions.at(questionIndex);
    const answers = question.controls.answers;

    question.controls.question.reset();
    question.controls.allowMultipleAnswers.reset();

    while (answers.length > MIN_ANSWER_COUNT) {
      answers.removeAt(answers.length - 1);
    }

    answers.controls.forEach((answer: AnswerControl): void => {
      answer.reset();
    });
  }
}
