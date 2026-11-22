import OpeningTitle from "./OpeningTitle";
import Album from "./Album";
import Story from "./Story";
import DryingLine from "./DryingLine";
import CaseSheet from "./CaseSheet";
import RescueDesk from "./RescueDesk";
import Features from "./Features";
import Reminders from "./Reminders";
import Closing from "./Closing";
import Projector from "./Projector";

export default function Waterline() {
  return (
    <>
      <a className="skip" href="#jot-desk">
        Skip to content
      </a>
      <OpeningTitle />
      <header className="studio-mast">
        <div>
          <a className="studio-brand" href="/" aria-label="CashAhead home">
            <img src="/mark.svg" width="30" height="30" alt="" />
            CashAhead
          </a>
          <nav aria-label="Primary">
            <a href="#desk">Rescue desk</a>
            <a href="#story">Studio crew</a>
            <a href="#drying">Case prints</a>
            <a className="studio-open" href="/mine">
              My studio <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      </header>
      <main id="main">
        <Album />
        <RescueDesk />
        <Story />
        <DryingLine />
        <CaseSheet />
        <Features />
        <Reminders />
        <Closing />
      </main>
      <footer>
        <span>© CashAhead</span>
        <span lang="te">మీ నగదు ప్రవాహం, ముందే చూడండి</span>
      </footer>
      <Projector />
    </>
  );
}
