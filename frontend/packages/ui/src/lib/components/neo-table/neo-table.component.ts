import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface NeoTableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  template?: TemplateRef<any>;
  cellFn?: (item: T) => string | number;
}

export interface NeoTableSort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface NeoTablePagination {
  page: number;
  pageSize: number;
  total: number;
}

@Component({
  selector: 'app-neo-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './neo-table.component.html',
  styleUrls: ['./neo-table.component.scss']
})
export class NeoTableComponent<T = any> implements AfterContentInit {
  @Input() data: T[] = [];
  @Input() columns: NeoTableColumn<T>[] = [];
  @Input() selectable = true;
  @Input() showActions = true;
  @Input() trackByFn: (item: T) => any = (item: any) => item.id;
  
  @Output() rowSelect = new EventEmitter<T[]>();
  @Output() rowAction = new EventEmitter<T>();
  @Output() pageChange = new EventEmitter<NeoTablePagination>();
  @Output() sortChange = new EventEmitter<NeoTableSort>();
  @Output() filterChange = new EventEmitter<string>();
  
  // Internal state
  searchTerm = '';
  showColumnMenu = false;
  selectedItems: T[] = [];
  allSelected = false;
  
  sortConfig: NeoTableSort = {
    column: '',
    direction: 'asc'
  };
  
  pagination: NeoTablePagination = {
    page: 1,
    pageSize: 10,
    total: 0
  };
  
  displayedData: T[] = [];

  constructor(private elementRef: ElementRef) {}
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.showColumnMenu && !this.elementRef.nativeElement.querySelector('.column-menu-button').contains(event.target) && 
        !this.elementRef.nativeElement.querySelector('.column-menu')?.contains(event.target)) {
      this.showColumnMenu = false;
    }
  }
  
  ngAfterContentInit() {
    // Initialize visible columns
    this.columns = this.columns.map(col => ({
      ...col,
      visible: col.visible !== false
    }));
    
    this.updateDisplayedData();
  }
  
  get visibleColumns() {
    return this.columns.filter(col => col.visible !== false);
  }
  
  get colSpan() {
    let span = this.visibleColumns.length;
    if (this.selectable) span++;
    if (this.showActions) span++;
    return span;
  }
  
  trackBy(item: T) {
    return this.trackByFn(item);
  }
  
  toggleColumnMenu() {
    this.showColumnMenu = !this.showColumnMenu;
  }
  
  toggleColumn(column: NeoTableColumn) {
    column.visible = column.visible === false;
    this.updateDisplayedData();
  }
  
  sort(columnKey: string) {
    if (this.sortConfig.column === columnKey) {
      // Toggle direction if already sorting by this column
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort column and default to ascending
      this.sortConfig = {
        column: columnKey,
        direction: 'asc'
      };
    }
    
    this.sortChange.emit(this.sortConfig);
    this.updateDisplayedData();
  }
  
  onSearch() {
    this.pagination.page = 1;
    this.filterChange.emit(this.searchTerm);
    this.updateDisplayedData();
  }
  
  goToPage(page: number) {
    if (page < 1 || page > Math.ceil(this.pagination.total / this.pagination.pageSize)) {
      return;
    }
    
    this.pagination.page = page;
    this.pageChange.emit(this.pagination);
    this.updateDisplayedData();
  }
  
  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    
    if (this.allSelected) {
      this.selectedItems = [...this.displayedData];
    } else {
      this.selectedItems = [];
    }
    
    this.rowSelect.emit(this.selectedItems);
  }
  
  toggleSelect(item: T) {
    const index = this.selectedItems.findIndex(i => this.trackByFn(i) === this.trackByFn(item));
    
    if (index === -1) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems.splice(index, 1);
    }
    
    this.allSelected = this.selectedItems.length === this.displayedData.length;
    this.rowSelect.emit(this.selectedItems);
  }
  
  isSelected(item: T) {
    return this.selectedItems.some(i => this.trackByFn(i) === this.trackByFn(item));
  }
  
  onAction(item: T) {
    this.rowAction.emit(item);
  }
  
  // Helper method to safely access item properties
  getCellValue(item: T, key: string): any {
    return (item as any)[key];
  }
  
  updateDisplayedData() {
    let filteredData = [...this.data];
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(item => {
        // Fix TypeScript error by using type assertion
        return Object.keys(item as object).some(key => {
          const value = (item as any)[key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(term);
        });
      });
    }
    
    // Apply sorting
    if (this.sortConfig.column) {
      filteredData.sort((a, b) => {
        const aValue = (a as any)[this.sortConfig.column];
        const bValue = (b as any)[this.sortConfig.column];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return this.sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    
    // Update pagination
    this.pagination.total = filteredData.length;
    
    // Apply pagination
    const startIndex = (this.pagination.page - 1) * this.pagination.pageSize;
    const endIndex = startIndex + this.pagination.pageSize;
    this.displayedData = filteredData.slice(startIndex, endIndex);
  }
} 