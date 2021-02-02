const startBtnContainer = document.querySelector(".start_btn");
const createQuizBtn = document.querySelector("#create_quiz_button");
const createQuizBtnContainer = createQuizBtn.parentElement;
const quizEditorContainer = document.querySelector("#quiz_editor");
const backToQuizButton = document.querySelector("#back_to_quiz_button");
const downloadQuizButton = document.querySelector("#download_quiz_button");
const addQuestionButton = document.querySelector("#plus_button");
const uploadQuizInput = document.querySelector("#upload_quiz_button");
const loadQuizButton = document.querySelector("#load_quiz_button");
var quizEditor;

class QuizEditor
{
    constructor(questions)
    {
        this.questions = questions;
    }

    fillQuestionList()
    {
        this.questions.forEach(question => {
            var questionContainer = document.querySelector("#que_num_1");
            if (question["numb"] > 1)
            {
                questionContainer = questionContainer.cloneNode(true);
                questionContainer.id = "que_num_" + question["numb"];
            }

            questionContainer.children[0].innerHTML =
                "Otázka: " + question["question"];
            quizEditorContainer.
            insertBefore(questionContainer, addQuestionButton);

            this.fillForm(
                document.querySelector("#" + questionContainer.id + " form"),
                question);
        });
    }

    fillForm(formContainer, question)
    {
        var formInputs =
            Array.from(formContainer.children).filter(x => x.tagName == "INPUT");

        formInputs[0].value = question["question"];

        for (var i = 0; i < 4; i++)
            formInputs[i + 1].value = question["options"][i];

        var ansIndex =
            question["options"].findIndex(x => x == question["answer"]) + 1;
        formInputs[5].value = ansIndex;

        var saveButton =
            formContainer.children[formContainer.children.length - 2];
        var removeButton = formContainer.lastElementChild;
        saveButton.setAttribute("question-num", question["numb"]);
        removeButton.setAttribute("question-num", question["numb"]);
    }

    saveQuestion(clickedButton)
    {
        var formContainer = clickedButton.parentElement;
        var formInputs =
            Array.from(formContainer.children).filter(x => x.tagName == "INPUT");

        var index = parseInt(clickedButton.getAttribute("question-num")) - 1;

        var title = formInputs[0].value;

        var options = [
            formInputs[1].value,
            formInputs[2].value,
            formInputs[3].value,
            formInputs[4].value
        ];

        var answer = options[parseInt(formInputs[5].value) - 1];

        if (answer < 1)
            answer = 1;
        if (answer > 4)
            answer = 4;

        var prevTitle = this.questions[index]["question"];
        this.questions[index] = {
            "numb": index + 1,
            "question": title,
            "answer": answer,
            "options": options
        };

        questions = this.questions;
        if (title != prevTitle)
        {
            this.refreshQuestionTitle(
                formContainer.parentElement.parentElement,
                "Otázka: " + title
            );
        }
    }

    async refreshQuestionTitle(questionContainer, newTitle)
    {
        var title = questionContainer.firstElementChild;
        title.style.opacity = 0;
        await new Promise(x => setTimeout(x, 400));
        title.innerHTML = newTitle;
        title.style.opacity = 1;
    }

    async addNewQuestion()
    {
        var lastNum = this.questions.length;
        var newQuestion = {
            numb: lastNum + 1,
            question: "",
            answer: "",
            options: ["", "", "", ""]
        };
        this.questions.push(newQuestion);
        questions = this.questions;

        var questionContainer =
            document.querySelector("#que_num_1").cloneNode(true);
        questionContainer.id = "que_num_" + (lastNum + 1);
        questionContainer.children[0].innerHTML = "Otázka: ";

        quizEditorContainer.insertBefore(questionContainer, addQuestionButton);

        var formContainer = questionContainer.children[1].firstElementChild;
        var formInputs =
            Array.from(formContainer).filter(x => x.tagName == "INPUT");
        formInputs.forEach(input => {
            input.value = null;
        });
        var saveButton =
            formContainer.children[formContainer.children.length - 2];
        var removeButton = formContainer.lastElementChild;
        saveButton.setAttribute("question-num", lastNum + 1);
        saveButton.setAttribute("has-listener", "false");
        removeButton.setAttribute("question-num", lastNum + 1);
        removeButton.setAttribute("has-listener", "false");

        var openIcon = questionContainer.lastElementChild;
        openIcon.setAttribute("has-listener", "false");

        AddFormIconListeners();
        AddSaveButtonListeners();
        AddRemoveButtonListeners();
        CheckRemovalValidity();

        questionContainer.classList.toggle("visible");
        await new Promise(x => setTimeout(x, 100));
        questionContainer.classList.toggle("visible");
    }

    removeQuestion(clickedButton)
    {
        var number = clickedButton.getAttribute("question-num");
        var parent = document.querySelector("#que_num_" + number);
        this.questions.splice(number - 1, 1);

        this.questions.forEach(question => {
            if (question["numb"] > number)
            {
                var questionContainer =
                    document.querySelector("#que_num_" + question["numb"]);
                var formContainer =
                    questionContainer.children[1].firstElementChild;

                var saveButton =
                    formContainer.children[formContainer.children.length - 2];
                saveButton.setAttribute("question-num", question["numb"] - 1);

                var removeButton = formContainer.lastElementChild;
                removeButton.setAttribute("question-num", question["numb"] - 1);
                questionContainer.id = "que_num_" + (question["numb"] - 1);

                question["numb"] -= 1;
            }
        });

        parent.remove();
        CheckRemovalValidity();
    }
}

async function ShowQuizEditor()
{
    quizEditorContainer.style.display = "flex";
    backToQuizButton.style.display = "block";
    downloadQuizButton.style.display = "block";
    addQuestionButton.style.display = "block";

    await new Promise(x => setTimeout(x, 10));

    startBtnContainer.style.opacity = 0;
    createQuizBtnContainer.style.opacity = 0;
    quizEditorContainer.classList.toggle("visible");
}

async function HideQuizEditor()
{
    startBtnContainer.style.opacity = 1;
    createQuizBtnContainer.style.opacity = 1;
    quizEditorContainer.classList.toggle("visible");
    window.scrollTo(0, 0);

    await new Promise(x => setTimeout(x, 400));

    quizEditorContainer.style.display = "none";
    backToQuizButton.style.display = "none";
    downloadQuizButton.style.display = "none";
    addQuestionButton.style.display = "none";
}

function ToggleForm(formContainer)
{
    if (formContainer.style.maxHeight)
    {
        formContainer.style.maxHeight = null;
        formContainer.style.marginTop = null;
    }
    else
    {
        formContainer.style.maxHeight = formContainer.scrollHeight + 'px';
        formContainer.style.marginTop = "1em";
    }
}

function AddFormIconListeners()
{
    var formAccordionIcons = document.querySelectorAll('.form_open_icon');
    formAccordionIcons.forEach(icon => {
        if (icon.getAttribute("has-listener") == "false")
        {
            icon.setAttribute("has-listener", "true");
            icon.addEventListener("click", function() {
                this.classList.toggle("active");

                var formContainer = this.previousElementSibling;
                ToggleForm(formContainer);

            }, false);
        }
    });
}

function AddSaveButtonListeners()
{
    var saveButtons = document.querySelectorAll(".save_button");
    saveButtons.forEach(button => {
        if (button.getAttribute("has-listener") == "false")
        {
            button.setAttribute("has-listener", "true");
            button.addEventListener("click", function() {
                quizEditor.saveQuestion(this);
            });
        }
    });
}

function AddRemoveButtonListeners()
{
    var removeButtons = document.querySelectorAll(".remove_button");
    removeButtons.forEach(button => {
        if (button.getAttribute("has-listener") == "false")
        {
            button.setAttribute("has-listener", "true");
            button.addEventListener("click", function() {
                quizEditor.removeQuestion(this);
            });
        }
    });
}

function CheckRemovalValidity()
{
    var removeButtons = document.querySelectorAll(".remove_button");
    if (quizEditor.questions.length <= 5)
    {
        removeButtons.forEach(button => {
            if (!button.classList.contains("inactive"))
                button.classList.add("inactive");
        });
    }
    else
    {
        removeButtons.forEach(button => {
            if (button.classList.contains("inactive"))
                button.classList.remove("inactive");
        });
    }
}

createQuizBtn.onclick = () =>
{
    if (!quizEditor)
        quizEditor = new QuizEditor(questions);

    if (document.querySelectorAll(".question_form_container").length <= 1)
    {
        quizEditor.fillQuestionList();
        AddFormIconListeners();
        AddSaveButtonListeners();
        AddRemoveButtonListeners();
        CheckRemovalValidity();
    }
    ShowQuizEditor();
}

backToQuizButton.onclick = () =>
{
    HideQuizEditor();
}

downloadQuizButton.onclick = () =>
{
    var data = new FormData();
    var jsonString = JSON.stringify(questions, null, 2);
    data.append('json', jsonString);

    var request = new XMLHttpRequest();
    request.open("POST", "../save_quiz.php", false);
    request.onload = function() {
        console.log(this.response);
        const anchor = document.createElement("a");
        anchor.setAttribute("href", "otazky.json");
        anchor.setAttribute("download", "otazky.json");
        anchor.click();
    }
    request.send(data);
}

addQuestionButton.onclick = () =>
{
    quizEditor.addNewQuestion();
}

loadQuizButton.onclick = () =>
{
    if (!quizEditor)
        quizEditor = new QuizEditor(questions);

    var uploadedFiles = uploadQuizInput.files;
    if (uploadedFiles.length <= 0)
        return;

    var reader = new FileReader();

    reader.onload = function(event) {
        console.log(event);
        try {
            quizEditor.questions = JSON.parse(event.target.result);
            questions = quizEditor.questions;
        } catch (e) {
            console.log(e.Message);
            alert("Chybný formát souboru.");
        }
    };

    reader.readAsText(uploadedFiles[0]);

    var questionContainers =
        document.querySelectorAll(".question_form_container");
    questionContainers.forEach(container => {
        if (container.id != "que_num_1")
            container.remove();
    });
}