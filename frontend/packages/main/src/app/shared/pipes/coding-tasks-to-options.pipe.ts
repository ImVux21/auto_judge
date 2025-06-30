import { Pipe, PipeTransform } from '@angular/core';
import { SelectOption } from 'packages/ui/src/lib/components/neo-select/neo-select.component';
import { CodingTask } from '../models/coding.model';

@Pipe({
  name: 'codingTasksToOptions',
  standalone: true
})
export class CodingTasksToOptionsPipe implements PipeTransform {
  transform(tasks: CodingTask[]): SelectOption[] {
    if (!tasks || !Array.isArray(tasks)) {
      return [];
    }
    
    return tasks.map(task => ({
      value: task.id!.toString(), // Convert id to string
      label: task.title
    }));
  }
} 