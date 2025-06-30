import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { NeoButtonComponent } from "./components/neo-button/neo-button.component";
import { NeoCardComponent } from "./components/neo-card/neo-card.component";
import { NeoCheckboxComponent } from "./components/neo-checkbox/neo-checkbox.component";
import { NeoCodeEditorComponent } from "./components/neo-code-editor/neo-code-editor.component";
import { NeoInputComponent } from "./components/neo-input/neo-input.component";
import { NeoMenubarContentComponent } from "./components/neo-menubar/neo-menubar-content.component";
import { NeoMenubarItemComponent } from "./components/neo-menubar/neo-menubar-item.component";
import { NeoMenubarMenuComponent } from "./components/neo-menubar/neo-menubar-menu.component";
import { NeoMenubarSeparatorComponent } from "./components/neo-menubar/neo-menubar-separator.component";
import { NeoMenubarTriggerComponent } from "./components/neo-menubar/neo-menubar-trigger.component";
import { NeoMenubarComponent } from "./components/neo-menubar/neo-menubar.component";
import { NeoSelectComponent } from "./components/neo-select/neo-select.component";
import { NeoTableComponent } from "./components/neo-table/neo-table.component";
import { NeoTextareaComponent } from "./components/neo-textarea/neo-textarea.component";

const NEO_COMPONENTS = [
  NeoButtonComponent,
  NeoCardComponent,
  NeoInputComponent,
  NeoTableComponent,
  NeoTextareaComponent,
  NeoMenubarComponent,
  NeoMenubarContentComponent,
  NeoMenubarItemComponent,
  NeoMenubarMenuComponent,
  NeoMenubarSeparatorComponent,
  NeoMenubarTriggerComponent,
  NeoCheckboxComponent,
  NeoSelectComponent,
  NeoCodeEditorComponent,
];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, ...NEO_COMPONENTS],
  exports: [...NEO_COMPONENTS],
})
export class UiModule {}
