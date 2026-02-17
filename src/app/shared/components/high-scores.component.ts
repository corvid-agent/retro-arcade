import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HighScore } from '../../core/models/game.model';

@Component({
  selector: 'app-high-scores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="scores">
      <h3 class="scores__title">{{ title() }}</h3>
      @if (scores().length === 0) {
        <p class="scores__empty">No scores yet. Play to set a record!</p>
      } @else {
        <table class="scores__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            @for (entry of scores(); track entry.date; let i = $index) {
              <tr [class.scores__highlight]="i === 0">
                <td>{{ i + 1 }}</td>
                <td>{{ entry.score }}</td>
                <td>{{ entry.date | date:'MM/dd' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .scores { width: 100%; }
    .scores__title {
      font-size: 0.6rem;
      color: var(--accent-amber);
      margin-bottom: var(--space-sm);
      text-align: center;
    }
    .scores__empty {
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      padding: var(--space-md);
    }
    .scores__table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-mono);
      font-size: 0.8rem;
    }
    .scores__table th {
      font-family: var(--font-pixel);
      font-size: 0.5rem;
      color: var(--text-tertiary);
      text-align: left;
      padding: var(--space-xs) var(--space-sm);
      border-bottom: 1px solid var(--border);
    }
    .scores__table td {
      padding: var(--space-xs) var(--space-sm);
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
    }
    .scores__highlight td {
      color: var(--accent-primary);
      font-weight: 600;
    }
  `],
})
export class HighScoresComponent {
  scores = input<HighScore[]>([]);
  title = input('HIGH SCORES');
}
