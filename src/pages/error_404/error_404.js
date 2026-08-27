import Handlebars from "handlebars";
import errorTpl from "../../layouts/error/error.hbs?raw";

import "../../layouts/error/error.css";
const templateContent = {
  code: "404",
  message: "Не туда попали",
};

const compileError = Handlebars.compile(errorTpl);
document.getElementById("error-container").innerHTML = compileError(templateContent);
