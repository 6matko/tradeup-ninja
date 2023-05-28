import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/i18n';
import { LegalPrivacyComponent } from './legal-privacy/legal-privacy.component';
import { LegalTosComponent } from './legal-tos/legal-tos.component';


const routes: Routes = [
    // If user tries to access nor tos, nor privacy policy then redirecting to home (about page)
    { path: '', redirectTo: '/about', pathMatch: 'full' },
    // Module is lazy loaded, see app-routing.module.ts
    { path: 'tos', component: LegalTosComponent, data: { title: extract('Terms of Service') } },
    { path: 'privacy', component: LegalPrivacyComponent, data: { title: extract('Privacy policy') } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class LegalDocumentsRoutingModule { }
