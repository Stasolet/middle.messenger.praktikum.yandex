import Handlebars from "handlebars";
import formFieldTpl from "../../components/form-field/form-field.hbs?raw";
import formTpl from "../../layouts/form/form.hbs?raw";

import "../../layouts/form/form.css";
import "../../components/form-field/form-field.css";
import "./signin.css";

Handlebars.registerPartial("form-field", formFieldTpl);

const formContents = {
  title: "Регистрация",
  buttonText: "Зарегистрироваться",
  fields: [
    { label: "Почта", name: "email", type: "email", labelPosition: "top" },
    { label: "Логин", name: "login", type: "text", labelPosition: "top" },
    { label: "Имя", name: "name", type: "text", labelPosition: "top" },
    { label: "Фамилия", name: "surname", type: "text", labelPosition: "top" },
    { label: "Телефон", name: "phone", type: "tel", labelPosition: "top" },
    { label: "Пароль", name: "password", type: "password", labelPosition: "top" },
    {
      label: "Пароль (ещё раз)",
      name: "passwordRepeat",
      type: "password",
      labelPosition: "top"
    },
  ],
  footer: { text: "Войти?", link: "/pages/login/login.html" },
};

const compiledLoginForm = Handlebars.compile(formTpl);
document.getElementById("signin-form").innerHTML =
  compiledLoginForm(formContents);
