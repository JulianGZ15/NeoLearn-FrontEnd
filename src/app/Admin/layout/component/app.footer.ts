import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        NeoLearn by
        <a href="https://github.com/JulianGZ15" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Julian Gonzalez</a>
    </div>`
})
export class AppFooter {}
