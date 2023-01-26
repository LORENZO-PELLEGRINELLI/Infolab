import { LitElement, html, css } from "lit";
const axios = require("axios").default;

export class Login extends LitElement {
  static properties = {
    username: "",
    password: "",
    pswVisibility: {},
  };

  constructor() {
    super();
    this.username = "user1";
    this.password = "password1";
    this.pswVisibility = false;
  }


  static styles = css`

  
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

  #container {
    width: 400px;
    max-width: 100%;
    min-height: 300px;
    background: white;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}



.title {
  align-self: center;
}


input[type="text"], input[type="password"] {
  position: relative;
  width: 100%;
  height: 40px;
  padding: 5px 10px;
  border: none;
  outline: none;
  font-size: 15pt;
  transition: .5s;
  margin-top: 10px;
}

.text-container {
  position: relative;
  border-bottom: 1px solid black;
}


.text-container span {
  position: absolute;
  transform: translateY(50%);
  bottom: 20px; 
  right: 10px;
  z-index: 2;
  color: rgba(10, 10, 128, 0.829);
  opacity: 0.0;
  transition: .5s;  
}

.text-container:hover span {
  opacity: 1.0;
  visibility: visible;
  cursor: pointer;
}




div:has(#submit_btn) {
  display: flex;
  justify-content: flex-end;
  padding-right: 10px;
}

#submit_btn {
  text-transform: uppercase;
  padding: 15px 20px;
  background: rgb(175, 175, 175);
  border: none;
  outline: none;
  cursor: pointer;
}



  `

  render() {
    return html`

    <div id="container">
      <h1 class="title">Come ti chiami?</h1>
      <div>
        <label>
          Username: <br/>
        <div class="text-container">
          <input
            type="text"
            @input=${this.onUsernameInput}
            .value=${this.username}
          />
        </div>
        </label>
      </div>

      <div>
        <label>
          Password: <br/>
          <div class="text-container">
          <input
            type=${ this.pswVisibility ? 'text' : 'password' }
            @input=${this.onPasswordInput}
            .value=${this.password}
          />
          <span @click=${this.setVisibility}>toggle</span>
          </div>
        </label>
      </div>
      <br />
      <div>
        <button id="submit_btn"  @click=${this.loginConfirm}>Connetti</button>
      </div>
    </div>
    `;
  }

  onUsernameInput(e) {
    const inputEl = e.target;
    this.username = inputEl.value;
  }

  onPasswordInput(e) {
    const inputEl = e.target;
    this.password = inputEl.value;
  }

  setVisibility() {
    this.pswVisibility = !this.pswVisibility
  }

  loginConfirm() {
    this.executeLoginCall()
      .then((response) => {
        this.dispatchEvent(
          new CustomEvent("login-confirm", {
            detail: {
              login: {
                username: this.username,
                password: this.password,
                headerName: response.data.headerName,
                token: response.data.token,
              },
            },
          })
        );
      })
      .catch((e) => {
        console.log(e);
      });
  }

  async executeLoginCall() {
    return axios({
      url: "/csrf",
      method: "get",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
      auth: {
        username: this.username,
        password: this.password,
      },
    });
  }
}

customElements.define("il-login", Login);
