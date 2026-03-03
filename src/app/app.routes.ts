import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ItineraryComponent } from './components/itinerary/itinerary.component';
import { StatuscheckComponent } from './components/statuscheck/statuscheck.component';
import { ScamscrollerComponent } from './components/scamscroller/scamscroller.component';
import { SigninComponent } from './components/signin/signin.component';
import { PlannerComponent } from './pages/planner/planner.component';
import { SafetyComponent } from './pages/safety/safety.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { MapscanvasComponent } from './components/mapscanvas/mapscanvas.component';
import { DriverListComponent } from './components/driver-list/driver-list.component';
// import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'my-trip', component: ItineraryComponent },
    { path: 'statuscheck', component: StatuscheckComponent },
    { path: 'scamscroller', component: ScamscrollerComponent },
    { path: 'signin', component: SigninComponent },
    { path: 'planner', component: PlannerComponent, },// canActivate: [AuthGuard] // Protetto: solo per utenti loggati
    { path: 'safety', component: SafetyComponent },
    { path: 'explore', component: ExploreComponent },
    { path: 'map-explorer', component: MapscanvasComponent },
    { path: 'drivers', component: DriverListComponent },

];
