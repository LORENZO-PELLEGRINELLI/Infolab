import { LitElement, html, css } from "lit";
import { resolveMarkdown } from "lit-markdown";

import "../../components/formatting-button";
import "../../components/Button-text";

import { MarkdownService } from "../../services/markdown-services";
export class Editor extends LitElement {
  static properties = {
    message: "",
    openPreview: false,
    selectedText: { startingPoint: NaN, endingPoint: NaN },
  };

  constructor() {
    super();
    this.message = "";
    this.openPreview = false;
    this.selectedText = null;
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }

    ul,
    ol {
      list-style-position: inside;
    }

    .formatting-bar {
      width: 100%;
      height: 40px;
      background: #bcc7d9;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0px 10px;
    }

    textarea {
      width: 100%;
      height: 150px;
      border: none;
      outline: none;
      padding: 5px;
      resize: none;
      overflow: auto;
      font-family: inherit;
    }

    div[class*="select-"] {
      position: relative;
      width: max-content;
    }

    div[class*="select-"] .dropdown {
      overflow: hidden;
      max-height: 0px;
      transition: 0.5s;
      position: absolute;
      top: 30px;
      left: 0px;
      min-width: 100px;
      background: #bcc7d9;
      z-index: 10;
    }

    div[class*="select-"]:hover .dropdown {
      overflow-y: auto;
      max-height: 100px;
      padding: 10px 8px;
    }

    .dropdown::-webkit-scrollbar {
      width: 3px;
      background: #677fa5;
    }

    .dropdown::-webkit-scrollbar-thumb {
      background: #507cc4;
    }

    .dropdown .option {
      cursor: pointer;
      transition: 0.5s;
      padding: 2px;
      display: flex;
      align-items: center;
      white-space: nowrap;
    }

    .dropdown .option:hover {
      background: #9faec5;
    }

    .dropdown input[type="radio"] {
      display: block;
      margin-left: 25px;
    }

    .previewer {
      padding: 10px;
      width: 100%;
      height: calc(100% - 40px);
      overflow-y: auto;
    }
  `;

  render() {
    return html`
      <!-- diventerà un componente -->
      <div class="formatting-bar">
        <il-formatting-button
          content="mdiFormatBold"
          @click=${this.insertBold}
        ></il-formatting-button>
        <il-formatting-button
          content="mdiFormatItalic"
          @click=${this.insertItalic}
        ></il-formatting-button>
        <il-formatting-button
          content="mdiFormatStrikethroughVariant"
          @click=${this.insertStrike}
        ></il-formatting-button>
        <il-formatting-button
          content="mdiLink"
          @click=${this.insertLink}
        ></il-formatting-button>
        <il-formatting-button
          content="mdiMinus"
          @click=${this.insertLine}
        ></il-formatting-button>

        <div class="select-list">
          <il-formatting-button
            content="mdiFormatListBulleted"
            @click=${this.insertList}
          ></il-formatting-button>
          <div class="dropdown">
            <div class="option">
              <label for="disc">
                <ul>
                  <li>example</li>
                  <li>example</li>
                  <li>example</li>
                </ul>
              </label>
              <input type="radio" name="forList" id="disc" checked />
            </div>

            <div class="option">
              <label for="number">
                <ol>
                  <li>example</li>
                  <li>example</li>
                  <li>example</li>
                </ol>
              </label>
              <input type="radio" name="forList" id="number" />
            </div>
          </div>
        </div>

        <div class="select-heading">
          <il-formatting-button
            content="mdiFormatTitle"
            @click=${this.insertHeading}
          ></il-formatting-button>
          <div class="dropdown">
            <div class="option">
              <label for="h1">
                <h1>Titolo 1</h1>
              </label>
              <input type="radio" name="forHeading" id="h1" checked />
            </div>
            <div class="option">
              <label for="h2">
                <h1>Titolo 2</h1>
              </label>
              <input type="radio" name="forHeading" id="h2" />
            </div>
            <div class="option">
              <label for="h3">
                <h1>Titolo 3</h1>
              </label>
              <input type="radio" name="forHeading" id="h3" />
            </div>
          </div>
        </div>

        <il-button-text @click=${this.togglePreviewer}></il-button-text>
      </div>

      ${!this.openPreview
        ? html`<textarea
            placeholder="Scrivi un messaggio..."
            @input=${this.onMessageInput}
            @mouseup=${this.setSelectedText}
            @keydown=${this.checkList}
            .value=${this.message}
          >
          </textarea>`
        : html`<div class="previewer">
            ${resolveMarkdown(MarkdownService.parseMarkdown(this.message))}
          </div>`}
    `;
  }

  onMessageInput(e) {
    const inputEl = e.target;
    this.message = inputEl.value;
  }

  togglePreviewer() {
    this.openPreview = !this.openPreview;
  }


  setSelectedText() {
    const textarea = this.getTextarea();

    this.selectedText = {
      startingPoint: textarea.selectionStart,
      endingPoint: textarea.selectionEnd,
    };

    this.dispatchEvent(
      new CustomEvent("is-selecting", {
        detail: {
          start: this.selectedText.startingPoint,
          end: this.selectedText.endingPoint,
        },
      })
    );
  }

  checkList(event) {
    if (event.key === "Enter") {
      const rows = this.message.split("\n");
      let last_row = rows[rows.length - 1];
      const indexOfPoint = last_row.indexOf(".");

      if (last_row.startsWith("* ")) {
        this.message += "\n* ";
        event.preventDefault();
        return;
      }

      if (
        indexOfPoint != -1 &&
        !isNaN(parseInt(last_row.slice(0, indexOfPoint))) &&
        last_row.startsWith(". ", indexOfPoint)
      ) {
        this.message +=
          "\n" +
          (parseInt(last_row.slice(0, indexOfPoint)) + 1).toString() +
          ". ";
        event.preventDefault();
        return;
      }
    }
  }

  insertInTextArea(str) {
    if (this.selectedText !== null) {
      this.message =
        this.message.slice(0, this.selectedText.startingPoint) +
        str +
        this.message.slice(this.selectedText.endingPoint);
    } else {
      this.message = this.message + str;
    }
    this.selectedText = null;
  }

  //funzioni per formatting-buttons

  getText(text) {
    const sel = window.getSelection();
    const t = sel ? sel.toString() : "";
    if (t !== "") sel.deleteFromDocument();
    else t = text;
    return t;
  }

  insertBold() {
    const text = this.getText("grassetto");
    this.insertInTextArea("**" + text + "**");
  }

  insertItalic() {
    const text = this.getText("italic");
    this.insertInTextArea("*" + text + "*");
  }

  insertStrike() {
    const text = this.getText("barrato");
    this.insertInTextArea("~~" + text + "~~");
  }

  insertLink() {
    const text = this.getText("testo");
    this.insertInTextArea("[" + text + "](link)");
  }

  insertLine() {
    this.insertInTextArea("\n - - - \n");
  }

  insertList() {
    const text = this.getText("punto");
    this.insertInTextArea(this.getTypeOfList(text));
  }

  insertHeading() {
    const text = this.getText("Titolo");
    this.insertInTextArea(this.getTypeOfHeading(text));
  }

  getTypeOfList(text) {
    const checkedList =
      this.renderRoot.querySelector(`input[name="forList"]:checked`) ?? null;

    switch (checkedList.id) {
      case "disc":
        return "* " + text;
      case "number":
        return "1. " + text;
    }
  }

  getTypeOfHeading(text) {
    const checkedHeading =
      this.renderRoot.querySelector(`input[name="forHeading"]:checked`) ?? null;

    switch (checkedHeading.id) {
      case "h1":
        return "# " + text;
      case "h2":
        return "## " + text;
      case "h3":
        return "### " + text;
    }
  }

  getTextarea() {
    return this.renderRoot.querySelector("textarea") ?? null;
  }

  updated(changed) {
    if (changed.has("message")) {
      this.dispatchEvent(
        new CustomEvent("typing-text", { detail: { content: this.message } })
      );
      this.getTextarea().focus();
    }
  }
}
customElements.define("il-editor", Editor);
