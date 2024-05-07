import {
  AfterViewChecked, AfterViewInit,
  Component,
  DoCheck,
  ElementRef,
  IterableDiffers,
  OnDestroy,
  OnInit,
  ViewChild, ViewEncapsulation
} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {CommonModule, ViewportScroller} from "@angular/common";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import { ScrollingModule} from "@angular/cdk/scrolling";
import {
  BehaviorSubject,
  debounceTime,
  delay,
  distinctUntilChanged, finalize,
  fromEvent,
  of,
  Subject,
  Subscription,
  takeUntil
} from "rxjs";
import {RagService} from "../ragservice.service";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MarkdownModule, MarkdownService} from "ngx-markdown";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatCardModule, CommonModule, FlexLayoutModule, FormsModule, MatFormFieldModule, MatInputModule, ScrollingModule, MatToolbarModule, MarkdownModule, MatProgressSpinnerModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit{
  @ViewChild("virtualViewport", {static: false}) public virtualViewport!: any;
  protected deactivatedSubject: Subject<boolean> = new Subject<boolean>();
  scrollToIndex$: Subject<void> = new Subject();
  subscriptions = new Subscription();
  messages$: BehaviorSubject<Array<Object>> =  new BehaviorSubject<Array<Object>>([]);
  copyright = '** RAG Demo Application ** &#x0a;&#x0a; &copy; 2024, Dr. Lukas Kaupp '
  loading = false;
  text: any;

  constructor(private ragservice: RagService, private mdService: MarkdownService ) {
  }

  public ngOnInit() {
    let answerObj =  {author:'FörderBot', text:
        "Der Q&A Bot mit Stand 30.04.2024 enthält " +
        "die aktuellen Förderlinien aus Hessen bzw. für Hessen in Bezug zu Hochschulen. " +
        "Hier können Fragen zu bestimmten Förderlinien, oder allgemeine Fragen gestellt werden. \n\n" +
        "** Wichtig ** \n\n" +
        "Beachten Sie, als ein Q&A Bot hat der Bot keinen Zugriff auf seine Historie. " +
        "Sie können also nicht chatten bzw. Ihre Antworten verfeiern, sondern müssen Ihre Frage um " +
        "vorherig abgefragte Informationen ergänzen / neu stellen."}
      const messages = this.messages$.getValue();
      messages.push(answerObj);
      this.messages$.next(messages);
      this.mdService.reload();
    fromEvent(window, 'resize')
      .pipe(
      distinctUntilChanged(),
      debounceTime(10),
      // sampleTime(0, animationFrameScheduler),
      takeUntil(this.deactivatedSubject)
      ).subscribe(() => {
        (<any>this.virtualViewport).checkViewportSize();
      });
     this.subscriptions.add(
      this.scrollToIndex$
        .pipe(delay(2))
        .subscribe(() =>
          this.virtualViewport.scrollTo({ bottom: 0, behavior: 'instant' })
        )
    );
  }

  public ngAfterViewInit() {
    this.scrollToIndex$.next();
  }

  public ngOnDestroy() {
    this.deactivatedSubject.next(true);
    this.deactivatedSubject.complete();
    this.subscriptions.unsubscribe();
  }

  addnew($event: any) {
    let question = $event.target.value;
    let questionObj =  {author:'Ich', text: ''+question}

    const messages = this.messages$.getValue();
    messages.push(questionObj);
    this.messages$.next(messages);


    this.text ='';
    this.virtualViewport.setRenderedRange({start: 0, end: this.virtualViewport.getRenderedRange().end + 1});
    this.virtualViewport.checkViewportSize();

    this.loading = true;

    this.scrollToIndex$.next();
    this.ragservice.getAnswer(question).pipe(
      finalize(() => this.loading = false)
    ).subscribe((answer) => {
      let answerObj =  {author:'FörderBot', text: ''+answer}
      const messages = this.messages$.getValue();
      messages.push(answerObj);
      this.messages$.next(messages);
      this.virtualViewport.setRenderedRange({start: 0, end: this.virtualViewport.getRenderedRange().end + 1});
      this.virtualViewport.checkViewportSize();
      this.scrollToIndex$.next();
    });


  }


}
