import * as Api from './api.js';
import Profile from "./profile.js";
import ProfileStatistics from "./profilestatistics.js";

window.addEventListener('load', () => {
    /* LOGIN */
    init();
    loadHome();
});

async function init(){
    document.getElementById("sideHome").addEventListener("click", () => {document.querySelectorAll(".nav-link").forEach(a => {a.classList.remove("active");});document.getElementById("sideHome").classList.add("active");loadHome();});
    document.getElementById("sideRecognize").addEventListener("click", () => {document.querySelectorAll(".nav-link").forEach(a => {a.classList.remove("active");});document.getElementById("sideRecognize").classList.add("active");loadRecognize();});
    document.getElementById("sideProfile").addEventListener("click", () => {document.querySelectorAll(".nav-link").forEach(a => {a.classList.remove("active");});document.getElementById("sideProfile").classList.add("active");loadProfile();});
    document.getElementById("sideAboutUs").addEventListener("click", () => {document.querySelectorAll(".nav-link").forEach(a => {a.classList.remove("active");});document.getElementById("sideAboutUs").classList.add("active");loadAboutUs();});
    const video = document.getElementById("webcam");
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) { video.srcObject = stream; })
            .catch(function (err0r) { console.log(`Video stream error: ${err0r}`); });
    }
}

function loadHome(){
    // video
    document.getElementById("videowrap").classList.remove("video");
    document.getElementById("webcam").removeEventListener("click", () => {loadHome()});
    // clear page content
    document.getElementById("content").innerHTML = "";
}

async function loadRecognize(){
    const loggedProfile = await Api.getAdminProfile("Admin");
    // video
    document.getElementById("videowrap").classList.add("video");
    document.getElementById("webcam").addEventListener("click", () => {loadHome()});
    // clear page content
    const content = document.getElementById("content");content.innerHTML = "";
    // header
    let img = document.createElement("img");img.setAttribute("class", "img-fluid");img.setAttribute("src", "svg/polito.png");content.appendChild(img);
    // body
    const container = document.createElement("div");container.setAttribute("id", "container");container.setAttribute("class", "p-4 m-4");content.appendChild(container);
    const title = document.createElement("p");title.setAttribute("class", "title text-dark");title.innerHTML = `<i class="fa fa-question mr-3"></i>I don't recognize those faces`;container.appendChild(title);
    container.appendChild(document.createElement("hr"));
    const list = document.createElement("div");list.setAttribute("id", "recognize_list");list.setAttribute("class", "row align-items-center justify-content-start");container.appendChild(list);
    // modals
    container.appendChild(createRecognizeModal());
    container.appendChild(createEditModal());
    //TODO: db call to fill list
    list.appendChild(recognizeListItem(loggedProfile, "svg/avatar.svg"));
}

async function loadProfile(){
    const loggedProfile = await Api.getAdminProfile("Admin");
    // video
    document.getElementById("videowrap").classList.add("video");
    document.getElementById("webcam").addEventListener("click", () => {loadHome()});
    // clear page content
    const content = document.getElementById("content");content.innerHTML = "";
    // header
    const img = document.createElement("img");img.setAttribute("class", "img-fluid");img.setAttribute("src", "svg/polito.png");content.appendChild(img);
    // body
    // logged profile
    const container = document.createElement("div");container.setAttribute("id", "container");container.setAttribute("class", "p-4 m-4");content.appendChild(container);
    let title = document.createElement("p");title.setAttribute("id", "profile_title");title.setAttribute("class", "title text-dark");title.innerHTML = `<i class="fa fa-user mr-3"></i>FirstName LastName`;container.appendChild(title);
    container.appendChild(document.createElement("hr"));
    container.appendChild(createProfile(false));
    populateProfile(loggedProfile, loggedProfile);
    container.appendChild(createProfileAccuracy(false));
    await populateProfileAccuracy(loggedProfile.profileId, false);
    // family
    title = document.createElement("p");title.setAttribute("class", "subtitle text-dark pt-4");title.innerHTML = `<i class="fa fa-home mr-2"></i>Family`;container.appendChild(title);
    container.appendChild(document.createElement("hr"));
    const list = document.createElement("div");list.setAttribute("class", "row align-items-center justify-content-start");container.appendChild(list);
    const profiles = await Api.getAllProfiles();
    profiles.forEach(profile => {if(loggedProfile.profileId !== profile.profileId)list.appendChild(familyListItem(loggedProfile, profile));});
    // modals
    container.appendChild(createEditModal());
    container.appendChild(createFamilyModal());
}

async function loadAboutUs(){
    /* HTML */
    document.getElementById("videowrap").classList.add("video");
    document.getElementById("webcam").addEventListener("click", () => {loadHome()});
    const content = document.getElementById("content");
    content.innerHTML = "";
    // header
    const img = document.createElement("img");
    img.setAttribute("class", "img-fluid");
    img.setAttribute("src", "svg/polito.png");
    content.appendChild(img);
    // container
    const container = document.createElement("div");
    container.setAttribute("id", "container");
    container.setAttribute("class", "p-4 m-4");
    content.appendChild(container);
    // title
    const title = document.createElement("p");
    title.setAttribute("class", "title text-dark");
    title.innerHTML = `<i class="fas fa-info mr-3"></i>Who we are`;
    container.appendChild(title);
    container.appendChild(document.createElement("hr"));
    // body
    const div = document.createElement("div");
    div.setAttribute("class", "row p-1 m-1");
    container.appendChild(div);
    let element = document.createElement("p");
    element.setAttribute("class", "text-secondary");
    element.innerHTML = `Hi, we are a group of students of 
        <a class="text-info" style="text-decoration: none;" href="https://www.polito.it/" target="_blank">Politecnico di Torino</a> 
        and this is an homework for the course Image Processing And Computer Vision.`;
    div.appendChild(element);
    element = document.createElement("p");
    element.setAttribute("class", "text-secondary");
    element.innerHTML = `The goal of this web application is to test the facerecognition python library, emulating a domestic video surveillance system`;
    div.appendChild(element);
    element = document.createElement("p");
    element.setAttribute("class", "text-secondary");
    element.innerHTML = `Please contact us for any question or problem via email at: S123456@studenti.polito.it`;
    div.appendChild(element);
}

function recognizeListItem(loggedProfile, imgPath){
    const img = document.createElement("img");
    img.setAttribute("id", `recognize_${imgPath}`);
    img.setAttribute("class", "avatar-overlay img-respinsive col-sm-4 col-md-3 col-lg-3 mb-4");
    img.setAttribute("src", imgPath);
    img.setAttribute("data-toggle", "modal");
    img.setAttribute("data-target", "#recognize_modal");
    img.addEventListener("click", () => {populateRecognizeModal(loggedProfile, imgPath);});
    return img;
}

function createRecognizeModal(){
    const modal = document.createElement("div");modal.setAttribute("id", "recognize_modal");modal.setAttribute("class", "modal fade");modal.setAttribute("role", "dialog");modal.setAttribute("aria-labelledby", "selectionModal");modal.setAttribute("data-backdrop", "static");modal.setAttribute("data-keyboard", "false");
    const doc = document.createElement("div");doc.setAttribute("class", "modal-dialog modal-dialog-scrollable modal-lg");doc.setAttribute("role", "document");modal.appendChild(doc);
    const content = document.createElement("div");content.setAttribute("class", "modal-content");doc.appendChild(content);
    // modal header
    const header = document.createElement("div");header.setAttribute("class", "modal-header");content.appendChild(header);
    const title = document.createElement("h5");title.setAttribute("class", "modal-title title");title.innerHTML = `<i class="fa fa-question mr-3"></i>Is part of the family`;header.appendChild(title);
    let element = document.createElement("button");element.setAttribute("type", "button");element.setAttribute("class", "close");element.setAttribute("data-dismiss", "modal");element.setAttribute("aria-label", "Close");element.innerHTML = `<span aria-hidden="true">&times;</span>`;element.addEventListener("click", () => {clearRecognizeModal();});header.appendChild(element);
    // modal body
    const body = document.createElement("div");body.setAttribute("class", "modal-body");content.appendChild(body);
    const div = document.createElement("div");div.setAttribute("class", "p-2 m-2");body.appendChild(div);
    let row = document.createElement("div");row.setAttribute("class", "row justify-content-center m-1");div.appendChild(row);
    element = document.createElement("img");element.setAttribute("id", "recognize_avatar");element.setAttribute("class", "col-md-4 col-lg-5 img-respinsive mb-2");element.setAttribute("src", "svg/avatar.svg");row.appendChild(element);
    element = document.createElement("p");element.setAttribute("class", "subtitle text-dark pt-4");element.innerText = `Select`;div.appendChild(element);
    div.appendChild(document.createElement("hr"));
    const selection = document.createElement("div");selection.setAttribute("id", "selection");selection.setAttribute("class", "row justify-content-start m-1");div.appendChild(selection);
    // modal footer
    const footer = document.createElement("div");footer.setAttribute("class", "modal-footer justify-content-between");content.appendChild(footer);
    element = document.createElement("button");element.setAttribute("id", "recognize_save");element.setAttribute("type", "button");element.setAttribute("class", "btn btn-outline-primary btn-rounded btn-md ml-4");element.setAttribute("data-dismiss", "modal");element.setAttribute("data-target", "#recognize_modal");element.innerHTML = `<i class="fa fa-times-circle mr-2"></i>Close`;footer.appendChild(element);
    element = document.createElement("button");element.setAttribute("id", "recognize_new");element.setAttribute("type", "button");element.setAttribute("class", "btn btn-outline-primary btn-rounded btn-md ml-4");element.setAttribute("data-dismiss", "modal");element.setAttribute("data-toggle", "modal");element.setAttribute("data-target", "#edit_modal");element.innerHTML = `<i class="fa fa-user-plus mr-2"></i>Create new profile`;footer.appendChild(element);
    return modal;
}

async function populateRecognizeModal(loggedProfile, imgPath){
    // avatar
    document.getElementById("recognize_avatar").setAttribute("src", imgPath);
    // selection list
    const profiles = await Api.getAllProfiles();
    profiles.forEach(profile => {document.getElementById("selection").appendChild(profileListItem(profile));});
    // save button
    document.getElementById("recognize_save").addEventListener("click", () => {
        submitRecognizeModal(loggedProfile);
    });
    // new profile button
    document.getElementById("recognize_new").addEventListener("click", () => {
        populateEditModal(loggedProfile, imgPath);
    });
}

function clearRecognizeModal(){
    document.getElementById("recognize_avatar").setAttribute("src", "svg/avatar.svg");
    document.getElementById("selection").innerHTML = ``;
}

async function submitRecognizeModal(loggedProfile){
    //TODO: db call delete image from recognize list
    let image = undefined;
    document.getElementById("selection").childNodes.forEach(div => {if(div.firstChild.classList.contains("selected")){image = div;}});
    if(image){
        const profileStatistics = await Api.getProfileStatisticsById(image.getAttribute("id").split("_")[1]);
        profileStatistics.faces++;
        const result = await Api.updateProfileStatistics(profileStatistics);
        loadRecognize(loggedProfile);
    }
}

function profileListItem(profile){
    const container = document.createElement("div");
    container.setAttribute("id", `select_${profile.profileId}`);
    container.setAttribute("class", "col-md-3 col-lg-4 mb-4");
    let img = document.createElement("img");
    img.setAttribute("class", "avatar-overlay img-respinsive border-primary");
    //TODO: img.setAttribute("src", profile.avatar);
    img.setAttribute("src", "svg/avatar.svg");
    img.addEventListener("click", () => {
        img.classList.toggle("selected");
        document.querySelector("#selection").childNodes.forEach(div => {
            if(div.getAttribute("id") !== `select_${profile.profileId}`){
                div.firstChild.classList.remove("selected");
            }
        });
        document.getElementById("recognize_save").innerHTML = `<i class="fa fa-times-circle mr-2"></i>Close`;
        document.querySelector("#selection").childNodes.forEach(div => {
            if(div.firstChild.classList.contains("selected")){
                document.getElementById("recognize_save").innerHTML = `<i class="fa fa-save mr-2"></i>Save`;
            }
        });
    });
    container.appendChild(img);
    return container;
}

function createEditModal(){
    const modal = document.createElement("div");modal.setAttribute("id", "edit_modal");modal.setAttribute("class", "modal fade");modal.setAttribute("tabindex", "-1");modal.setAttribute("role", "dialog");modal.setAttribute("aria-labelledby", "editModal");modal.setAttribute("aria-hidden", "true");modal.setAttribute("data-backdrop", "static");modal.setAttribute("data-keyboard", "false");
    const doc = document.createElement("div");doc.setAttribute("class", "modal-dialog modal-dialog-scrollable modal-lg");doc.setAttribute("role", "document");modal.appendChild(doc);
    const content = document.createElement("div");content.setAttribute("class", "modal-content");doc.appendChild(content);
    // modal header
    const header = document.createElement("div");header.setAttribute("class", "modal-header");content.appendChild(header);
    const title = document.createElement("h5");title.setAttribute("id", "edit_title");title.setAttribute("class", "modal-title title");header.appendChild(title);header.appendChild(title);
    let element = document.createElement("button");element.setAttribute("type", "button");element.setAttribute("class", "close");element.setAttribute("data-dismiss", "modal");element.setAttribute("aria-label", "Close");element.innerHTML = `<span aria-hidden="true">&times;</span>`;element.addEventListener("click", () => {clearEditModal();});header.appendChild(element);
    // modal body
    const body = document.createElement("div");body.setAttribute("class", "modal-body");content.appendChild(body);
    let div = document.createElement("div");div.setAttribute("class", "p-2 m-2");body.appendChild(div);
    let row = document.createElement("div");row.setAttribute("class", "row align-items-center justify-content-around p-1 m-1");div.appendChild(row);
    const form =  document.createElement("form");row.appendChild(form);
    const form_row =  document.createElement("div");form_row.setAttribute("class", "form-row");form.appendChild(form_row);
    div =  document.createElement("div");div.setAttribute("class", "col-md-5 col-lg-4");form_row.appendChild(div);
    let group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    element = document.createElement("img");element.setAttribute("id", "edit_avatar");element.setAttribute("class", "img-rounded img-respinsive col-12 m-2");element.setAttribute("src", "svg/avatar.svg");group.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    let input = document.createElement("div");input.setAttribute("class", "custom-file");group.appendChild(input);
    element = document.createElement("input");element.setAttribute("id", "edit_upload");element.setAttribute("name", "avatar");element.setAttribute("class", "custom-file-input");element.setAttribute("type", "file");element.setAttribute("style", "cursor: pointer;");input.appendChild(element);
    element = document.createElement("label");element.setAttribute("class", "custom-file-label");element.setAttribute("for", "edit_upload");element.innerHTML = `<i class="fa fa-image mr-2"></i>Upload photo`;input.appendChild(element);
    div =  document.createElement("div");div.setAttribute("class", "col-md-7 col-lg-8");form_row.appendChild(div);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    input = document.createElement("div");input.setAttribute("class", "input-group");group.appendChild(input);
    element = document.createElement("input");element.setAttribute("id", "edit_firstname");element.setAttribute("class", "form-control border-warning");element.setAttribute("type", "text");element.setAttribute("placeholder", "First name*");
    element.onkeyup = function(){
        if(document.getElementById("edit_firstname").value.length === 0) document.getElementById("edit_firstname").classList.add("border-warning");
        else document.getElementById("edit_firstname").classList.replace("border-warning", "border-success");
    };
    input.appendChild(element);
    element = document.createElement("input");element.setAttribute("id", "edit_lastname");element.setAttribute("class", "form-control");element.setAttribute("type", "text");element.setAttribute("placeholder", "Last name");input.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    input = document.createElement("div");input.setAttribute("class", "input-group");group.appendChild(input);
    element = document.createElement("input");element.setAttribute("id", "edit_phone");element.setAttribute("class", "form-control border-warning");element.setAttribute("type", "tel");element.setAttribute("placeholder", "Phone number*");
    element.onkeyup = function(){
        if(document.getElementById("edit_phone").value.length <= 8) document.getElementById("edit_phone").classList.replace("border-success", "border-warning");
        else document.getElementById("edit_phone").classList.replace("border-warning", "border-success");
    };
    input.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "input-group-append");input.appendChild(group);
    element = document.createElement("button");element.setAttribute("class", "btn btn-secondary");element.setAttribute("type", "button");element.innerHTML = `<i id="edit_phonebutton" class="fa fa-bell-slash"></i>`;
    element.addEventListener("click", () => {
        document.getElementById("edit_phonebutton").classList.toggle("fa-bell-slash");
        document.getElementById("edit_phonebutton").classList.toggle("fa-bell");
    });
    group.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    input = document.createElement("div");input.setAttribute("class", "input-group");group.appendChild(input);
    group = document.createElement("div");group.setAttribute("class", "input-group-prepend");input.appendChild(group);
    element = document.createElement("span");element.setAttribute("class", "input-group-text");element.innerText = `@`;group.appendChild(element);
    element = document.createElement("input");element.setAttribute("id", "edit_mail");element.setAttribute("class", "form-control");element.setAttribute("type", "text");element.setAttribute("placeholder", "E-mail address");element.setAttribute("aria-label", "Username");element.setAttribute("aria-describedby", "basic-addon1");input.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "input-group-append");input.appendChild(group);
    element = document.createElement("button");element.setAttribute("class", "btn btn-secondary");element.setAttribute("type", "button");element.innerHTML = `<i id="edit_mailbutton" class="fa fa-bell-slash"></i>`;
    element.addEventListener("click", () => {
        document.getElementById("edit_mailbutton").classList.toggle("fa-bell-slash");
        document.getElementById("edit_mailbutton").classList.toggle("fa-bell");
    });
    group.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    input = document.createElement("div");input.setAttribute("class", "input-group");group.appendChild(input);
    group = document.createElement("div");group.setAttribute("class", "input-group-prepend");input.appendChild(group);
    element = document.createElement("label");element.setAttribute("class", "input-group-text");element.setAttribute("for", "edit_systemrole");element.innerText = `System role`;
    element.addEventListener("click", () => {
        document.getElementById("edit_notification_adv").classList.remove("text-danger", "text-warning");
        document.getElementById("edit_notification_adv").classList.add("text-secondary", "show");
        document.getElementById("edit_notification_adv").innerHTML = `<i class="fas fa-info mr-3"></i><b>These badges specify the roles related to this user for the system and the family and to which priviledges it has access.</b>`;
    });
    group.appendChild(element);
    group = document.createElement("select");group.setAttribute("id", "edit_system");group.setAttribute("class", "custom-select border-warning");
    group.onchange = function(){
        if(document.getElementById("edit_system").value == 0){document.getElementById("edit_system").classList.add("border-warning");}
        else{document.getElementById("edit_system").classList.replace("border-warning", "border-success");}
    };
    input.appendChild(group);
    element = document.createElement("option");element.setAttribute("value", "0");element.innerText = `Choose...*`;element.selected = true;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "1");element.innerText = `Admin`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "2");element.innerText = `Adult`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "3");element.innerText = `Minor`;group.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    input = document.createElement("div");input.setAttribute("class", "input-group");group.appendChild(input);
    group = document.createElement("div");group.setAttribute("class", "input-group-prepend");input.appendChild(group);
    element = document.createElement("label");element.setAttribute("class", "input-group-text");element.setAttribute("for", "edit_familyrole");element.innerText = `Family role`;group.appendChild(element);
    element.addEventListener("click", () => {
        document.getElementById("edit_notification_adv").classList.remove("text-danger", "text-warning");
        document.getElementById("edit_notification_adv").classList.add("text-secondary", "show");
        document.getElementById("edit_notification_adv").innerHTML = `<i class="fas fa-info mr-3"></i><b>These badges specify the roles related to this user for the system and the family and to which priviledges it has access.</b>`;
    });
    group = document.createElement("select");group.setAttribute("id", "edit_family");group.setAttribute("class", "custom-select");input.appendChild(group);
    element = document.createElement("option");element.setAttribute("value", "0");element.innerText = `Choose...`;element.selected = true;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "1");element.innerText = `Father`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "2");element.innerText = `Mother`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "3");element.innerText = `Son`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "4");element.innerText = `Daughter`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "5");element.innerText = `Male Friend`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "6");element.innerText = `Female Friend`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "7");element.innerText = `Other`;group.appendChild(element);
    div = document.createElement("div");div.setAttribute("class", "col-12");form.appendChild(div);
    const span = document.createElement("span");span.setAttribute("id", "edit_notification_adv");span.setAttribute("class", "notification-adv text-warning show");span.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>Yellow fields are mandatory</b>`;
    span.addEventListener("click", () => {
        document.getElementById("edit_notification_adv").classList.remove("show", "text-danger", "text-secondary");
        document.getElementById("edit_notification_adv").classList.add("text-warning");
        document.getElementById("edit_notification_adv").innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>Yellow fields are mandatory</b>`;});
    div.appendChild(span);
    // modal footer
    const footer = document.createElement("div");footer.setAttribute("class", "modal-footer justify-content-start");content.appendChild(footer);
    element = document.createElement("button");element.setAttribute("id", "edit_save");element.setAttribute("type", "button");element.setAttribute("class", "btn btn-outline-primary btn-rounded btn-md ml-4");element.innerHTML = `<i class="fa fa-save mr-2"></i>Save`;footer.appendChild(element);
    return modal;
}

function populateEditModal(loggedProfile, profile){
    let update = true;
    if (typeof profile === 'string' || profile instanceof String){
        document.getElementById("edit_title").innerHTML = `<i class="fa fa-user-plus mr-2"></i>Create new profile`;
        document.getElementById("edit_avatar").setAttribute("src", profile);
        update = false;
    } else {
        document.getElementById("edit_title").innerHTML = `<i class="fa fa-edit mr-2"></i>Edit profile`;
        document.getElementById("edit_avatar").setAttribute("src", "svg/avatar.svg");
        //document.getElementById("edit_avatar").setAttribute("src", profile.avatar);
        document.getElementById("edit_firstname").value = profile.firstName;
        document.getElementById("edit_firstname").classList.replace("border-warning", "border-success");
        document.getElementById("edit_lastname").value = profile.lastName;
        document.getElementById("edit_phone").value = profile.phone;
        document.getElementById("edit_phone").classList.replace("border-warning", "border-success");
        if(profile.notificationsPhone){document.getElementById("edit_phonebutton").classList.replace("fa-bell-slash", "fa-bell");}
        document.getElementById("edit_mail").value = profile.email;
        if(profile.notificationsEmail){document.getElementById("edit_mailbutton").classList.replace("fa-bell-slash", "fa-bell");}
        document.getElementById("edit_system").childNodes.forEach(child => {if(child.innerText === profile.system)document.getElementById("edit_system").value = child.value;});
        document.getElementById("edit_system").classList.replace("border-warning", "border-success");
        document.getElementById("edit_family").childNodes.forEach(child => {if(child.innerText === profile.family)document.getElementById("edit_family").value = child.value;});
    }
    document.getElementById("edit_save").addEventListener("click", () => {submitEditModal(loggedProfile, update);});
    //TODO: capture file
    const file = document.getElementById("edit_upload");
    file.addEventListener('change', readFile, false);
}

function readFile(){
    // file checks
    if (this.files && this.files[0]) {
        // file type
        if (!this.files[0].type.match(/image.*/)) {
            document.getElementById("edit_notification_adv").classList.remove("text-warning", "text-secondary");
            document.getElementById("edit_notification_adv").classList.add("show", "text-danger");
            document.getElementById("edit_notification_adv").innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>Only images are allowed</b>`;
            return;
        }
        // file size
        const size = 500;
        if (this.files[0].size > (size*2048)) {
            document.getElementById("edit_notification_adv").classList.remove("text-warning", "text-secondary");
            document.getElementById("edit_notification_adv").classList.add("show", "text-danger");
            document.getElementById("edit_notification_adv").innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>Max allowed image size is ${size}KB</b>`;
            return;
        }
    } else return;
    let FR = new FileReader();
    FR.onload = function(e) {document.getElementById("edit_avatar").setAttribute("src", e.target.result);};
    FR.readAsDataURL(this.files[0]);
}

function clearEditModal(){
    document.getElementById("edit_title").innerHTML = ``;
    document.getElementById("edit_avatar").setAttribute("src", "svg/avatar.svg");
    document.getElementById("edit_firstname").value = ``;
    document.getElementById("edit_firstname").classList.replace("border-success", "border-warning");
    document.getElementById("edit_lastname").value = ``;
    document.getElementById("edit_phone").value = ``;
    document.getElementById("edit_phone").classList.replace("border-success", "border-warning");
    document.getElementById("edit_phonebutton").classList.replace("fa-bell-slash", "fa-bell");
    document.getElementById("edit_mail").value = ``;
    document.getElementById("edit_mailbutton").classList.replace("fa-bell-slash", "fa-bell");
    document.getElementById("edit_system").value = 0;
    document.getElementById("edit_system").classList.replace("border-success", "border-warning");
    document.getElementById("edit_family").value = 0;
}

async function submitEditModal(loggedProfile, update){
    if(document.getElementById("edit_firstname").classList.contains("border-warning") || document.getElementById("edit_phone").classList.contains("border-warning") || document.getElementById("edit_system").classList.contains("border-warning")){
        document.getElementById("edit_notification_adv").classList.remove("text-warning", "text-secondary");
        document.getElementById("edit_notification_adv").classList.add("show", "text-danger");
        document.getElementById("edit_notification_adv").innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>Yellow fields are mandatory</b>`;
    } else {
        let directory = document.getElementById("edit_avatar").getAttribute("src");
        if(document.getElementById('edit_upload').files[0]){
            directory = await Api.uploadNewAvatarImage(document.getElementById('edit_upload').files[0], `${document.getElementById("edit_firstname").value} ${document.getElementById("edit_lastname").value}`);
            directory = directory.directory;
        }
        const newProfile = new Profile(
            document.getElementById("edit_firstname").value,document.getElementById("edit_lastname").value,
            document.getElementById("edit_phone").value,document.getElementById("edit_mail").value,"","",
            document.getElementById("edit_phonebutton").classList.contains("fa-bell") || document.getElementById("edit_mailbutton").classList.contains("fa-bell"),
            document.getElementById("edit_phonebutton").classList.contains("fa-bell"),document.getElementById("edit_mailbutton").classList.contains("fa-bell"),
            directory
        );
        document.getElementById("edit_system").childNodes.forEach(child => {if(document.getElementById("edit_system").value === child.value)newProfile.system = child.innerText;});
        document.getElementById("edit_family").childNodes.forEach(child => {if(document.getElementById("edit_family").value === child.value)newProfile.family = child.innerText;});
        $("#edit_modal").modal("toggle");
        if(update){
            await Api.updateProfile(newProfile);
            loadProfile(loggedProfile);
        }
        else{
            await Api.newProfile(newProfile);
            loadRecognize(loggedProfile);
        };
    }
}

function createProfile(modal){
    const profile = document.createElement("div");if(modal){profile.setAttribute("id", "family");}else{profile.setAttribute("id", "profile");}
    profile.setAttribute("class", "row align-items-center justify-content-start");
    let div = document.createElement("div");if(modal){div.setAttribute("id", "family_avatar");}else{div.setAttribute("id", "profile_avatar");}div.setAttribute("class", "avatar-overlay col-md-4 col-lg-3 mb-2");profile.appendChild(div);
    let element = document.createElement("img");if(modal){element.setAttribute("id", "family_image");}else{element.setAttribute("id", "profile_image");}element.setAttribute("class", "img-rounded img-respinsive");element.setAttribute("src", "svg/avatar.svg");div.appendChild(element);
    div = document.createElement("ul");div.setAttribute("class", "col-md-8 col-lg-9 justify-content-start");profile.appendChild(div);
    element = document.createElement("li");div.appendChild(element);
    let span = document.createElement("span");if(modal){span.setAttribute("id", "family_notifications_main");}else{span.setAttribute("id", "profile_notifications_main");}span.setAttribute("class", "notification notification-main mb-2");span.classList.add("text-secondary");span.innerHTML = `<i class="fa fa-bell-slash mr-3"></i>`;element.appendChild(span);
    element = document.createElement("b");if(modal){element.setAttribute("id", "family_notifications_main_text");}else{element.setAttribute("id", "profile_notifications_main_text");}element.innerText = `Notifications`;span.appendChild(element);
    element = document.createElement("li");div.appendChild(element);
    span = document.createElement("span");if(modal){span.setAttribute("id", "family_notifications_phone");}else{span.setAttribute("id", "profile_notifications_phone");}span.setAttribute("class", "notification mb-2");span.classList.add("text-secondary");span.innerHTML = `<i class="fa fa-phone-slash mr-3"></i>`;element.appendChild(span);
    element = document.createElement("b");if(modal){element.setAttribute("id", "family_notifications_phone_text");}else{element.setAttribute("id", "profile_notifications_phone_text");}element.innerText = `Phone`;span.appendChild(element);
    element = document.createElement("li");div.appendChild(element);
    span = document.createElement("span");if(modal){span.setAttribute("id", "family_notifications_email");}else{span.setAttribute("id", "profile_notifications_email");}span.setAttribute("class", "notification mb-2");span.classList.add("text-secondary");span.innerHTML = `<i class="fa fa-envelope-open mr-3"></i>`;element.appendChild(span);
    element = document.createElement("b");if(modal){element.setAttribute("id", "family_notifications_email_text");}else{element.setAttribute("id", "profile_notifications_email_text");}element.innerText = `Email`;span.appendChild(element);
    element = document.createElement("li");div.appendChild(element);
    span = document.createElement("span");if(modal){span.setAttribute("id", "family_notifications_adv");}else{span.setAttribute("id", "profile_notifications_adv");}span.setAttribute("class", "notification-adv text-danger");span.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>You can enable/disable phone and email notifications separately</b>`;element.appendChild(span);
    element = document.createElement("b");if(modal){element.setAttribute("id", "family_notifications_adv_text");}else{element.setAttribute("id", "profile_notifications_adv_text");}element.innerText = `ADV`;span.appendChild(element);
    element = document.createElement("li");element.setAttribute("class", "mt-2");div.appendChild(element);
    span = document.createElement("button");if(modal){span.setAttribute("id", "family_system");}else{span.setAttribute("id", "profile_system");}span.setAttribute("class", "btn btn-secondary btn-rounded");span.innerText = `System role`;element.appendChild(span);
    span = document.createElement("button");if(modal){span.setAttribute("id", "family_family");}else{span.setAttribute("id", "profile_family");}span.setAttribute("class", "btn btn-info btn-rounded btn-md ml-3");span.innerText = `Family role`;element.appendChild(span);
    return profile;
}

function populateProfile(loggedProfile, profile){
    // elements
    let id = "profile_";
    if(loggedProfile.profileId != profile.profileId) id = "family_";
    let profileTitle = document.getElementById(`${id}title`);
    const profileAvatar = document.getElementById(`${id}avatar`);
    const notificationsMain = document.getElementById(`${id}notifications_main`);
    const notificationsMainText = document.getElementById(`${id}notifications_main_text`);
    const notificationsPhone = document.getElementById(`${id}notifications_phone`);
    const notificationsPhoneText = document.getElementById(`${id}notifications_phone_text`);
    const notificationsEmail = document.getElementById(`${id}notifications_email`);
    const notificationsEmailText = document.getElementById(`${id}notifications_email_text`);
    const notificationsAdv = document.getElementById(`${id}notifications_adv`);
    const notificationsAdvText = document.getElementById(`${id}notifications_adv_text`);
    const profileSystem = document.getElementById(`${id}system`);
    const profileFamily = document.getElementById(`${id}family`);
    // if profile is inside a modal
    if(loggedProfile.profileId != profile.profileId){profileAvatar.setAttribute("class", `avatar col-md-4 col-lg-3 mb-2`);}
    else {const editButton = document.createElement("span");editButton.setAttribute("class", "overlay text-primary");editButton.setAttribute("data-toggle", "modal");editButton.setAttribute("data-target", "#edit_modal");editButton.innerHTML = `<i class="fa fa-edit mr-2"></i>`;editButton.addEventListener("click", () => {populateEditModal(loggedProfile, profile)});profileAvatar.appendChild(editButton);}
    // fill fields
    profileTitle.innerHTML = `<i class="fa fa-user mr-3"></i>${profile.firstName} ${profile.lastName}`;
    notificationsPhoneText.innerText = profile.phone;
    if(profile.email == "") notificationsEmail.setAttribute("display", "none"); else notificationsEmailText.innerText = profile.email;
    if(profile.notifications){notificationsMain.classList.replace("text-secondary", "text-primary");notificationsMain.firstChild.classList.replace("fa-bell-slash", "fa-bell");showAdv("warning", (notificationsMain.getAttribute("id").split("_")[0] === "family"));}
    if(profile.notificationsPhone){notificationsPhone.classList.replace("text-secondary", "text-primary");notificationsPhone.firstChild.classList.replace("fa-phone-slash", "fa-phone");}
    if(profile.notificationsEmail){notificationsEmail.classList.replace("text-secondary", "text-primary");notificationsEmail.firstChild.classList.replace("fa-envelope-open", "fa-envelope");}
    profileSystem.innerText = profile.system;
    if(profile.family == "") profileFamily.setAttribute("style", "visibility: hidden"); else profileFamily.innerText = profile.family;
    // listeners
    notificationsMain.addEventListener("click", () => {
        const modal = notificationsMain.getAttribute("id").split("_")[0] === "family";
        if(notificationsMain.firstChild.classList.contains("fa-bell")){
            notificationsMain.classList.replace("text-primary", "text-secondary");
            notificationsMain.firstChild.classList.replace("fa-bell", "fa-bell-slash");
            notificationsPhone.classList.replace("text-primary", "text-secondary");
            notificationsPhone.firstChild.classList.replace("fa-phone", "fa-phone-slash");
            if(notificationsEmail.getAttribute("display") !== "none"){
                notificationsEmail.classList.replace("text-primary", "text-secondary");
                notificationsEmail.firstChild.classList.replace("fa-envelope", "fa-envelope-open");
            }
            showAdv("warning", modal);
        } else {
            notificationsMain.classList.replace("text-secondary", "text-primary");
            notificationsMain.firstChild.classList.replace("fa-bell-slash", "fa-bell");
            notificationsPhone.classList.replace("text-secondary", "text-primary");
            notificationsPhone.firstChild.classList.replace("fa-phone-slash", "fa-phone");
            if(profile.email != ""){
                notificationsEmail.classList.replace("text-secondary", "text-primary");
                notificationsEmail.firstChild.classList.replace("fa-envelope-open", "fa-envelope");
            }
        }
        const newProfile = new Profile(profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, 
            !notificationsMain.firstChild.classList.contains("fa-bell-slash"), !notificationsPhone.firstChild.classList.contains("fa-phone-slash"), !notificationsEmail.firstChild.classList.contains("fa-envelope-open"), profile.avatar);
        Api.updateProfile(newProfile);
        showAdv("warning", modal);
        if(modal) profile = newProfile; else loggedProfile = newProfile;
    });
    notificationsPhone.addEventListener("click", () => {
        const modal = notificationsPhone.getAttribute("id").split("_")[0] === "family";
        if(notificationsMain.firstChild.classList.contains("fa-bell-slash"))
            showAdv("danger", modal);
        else {
            if(notificationsPhone.firstChild.classList.contains("fa-phone-slash")){
                notificationsPhone.classList.replace("text-secondary", "text-primary");
                notificationsPhone.firstChild.classList.replace("fa-phone-slash", "fa-phone");
            } else {
                notificationsPhone.classList.replace("text-primary", "text-secondary");
                notificationsPhone.firstChild.classList.replace("fa-phone", "fa-phone-slash");
            }
            const newProfile = new Profile(profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, 
                !notificationsMain.firstChild.classList.contains("fa-bell-slash"), !notificationsPhone.firstChild.classList.contains("fa-phone-slash"), !notificationsEmail.firstChild.classList.contains("fa-envelope-open"), profile.avatar);
            Api.updateProfile(newProfile);
            showAdv("warning", modal);
            if(modal) profile = newProfile; else loggedProfile = newProfile;
        }
    });
    notificationsEmail.addEventListener("click", () => {
        const modal = notificationsEmail.getAttribute("id").split("_")[0] === "family";
        if(notificationsMain.firstChild.classList.contains("fa-bell-slash"))
            showAdv("danger", modal);
        else {
            if(notificationsEmail.firstChild.classList.contains("fa-envelope-open")){
                notificationsEmail.classList.replace("text-secondary", "text-primary");
                notificationsEmail.firstChild.classList.replace("fa-envelope-open", "fa-envelope");
            } else {
                notificationsEmail.classList.replace("text-primary", "text-secondary");
                notificationsEmail.firstChild.classList.replace("fa-envelope", "fa-envelope-open");
            }
            const newProfile = new Profile(profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, 
                !notificationsMain.firstChild.classList.contains("fa-bell-slash"), !notificationsPhone.firstChild.classList.contains("fa-phone-slash"), !notificationsEmail.firstChild.classList.contains("fa-envelope-open"), profile.avatar);
            Api.updateProfile(newProfile);
            showAdv("warning", modal);
            if(modal) profile = newProfile; else loggedProfile = newProfile;
        }
    });
    notificationsAdv.addEventListener("click", () => {notificationsAdv.classList.toggle("show");});
    profileSystem.addEventListener("click", () => {showAdv("info", (profileSystem.getAttribute("id").split("_")[0] === "family"));});
    profileFamily.addEventListener("click", () => {showAdv("info", (profileFamily.getAttribute("id").split("_")[0] === "family"));});
}

function showAdv(message, modal){
    let id = "profile_";
    if(modal) id = "family_";
    const adv = document.getElementById(`${id}notifications_adv`);
    adv.classList.remove("text-secondary", "text-warning", "text-danger");
    adv.classList.toggle("show");
    switch(message){
        case "info":{
            adv.classList.add("text-secondary");
            adv.innerHTML = `<i class="fas fa-info mr-3"></i><b>These badges specify the roles related to this user for the system and the family and to which priviledges it has access</b>`;
            break;
        }
        case "warning":{
            adv.classList.add("text-warning");
            adv.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>You can enable/disable phone and email notifications separately</b>`;
            break;
        }
        case "danger":{
            adv.classList.add("show", "text-danger");
            adv.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>You need to turn on notifications first</b>`;
            break;
        }
        default:{
            adv.classList.remove("show", "text-danger");
            adv.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>ADV OPTION ERROR -> message: ${message}</b>`;
            break;
        }
    }
}

function createProfileAccuracy(modal){
    const container = document.createElement("div");if(modal){container.setAttribute("id", "family_accuracy");}else{container.setAttribute("id", "profile_accuracy");}container.setAttribute("class", "row align-items-center justify-content-around pt-2");
    let div = document.createElement("span");div.setAttribute("class", "col-12 text-secondary");container.appendChild(div);
    let element = document.createElement("b");element.innerText = `Algorithm performance`;div.appendChild(element);
    element = document.createElement("div");element.setAttribute("class", "col-12");container.appendChild(element);
    div = document.createElement("div");div.setAttribute("class", "progress");div.setAttribute("style", "height: 2em;");element.appendChild(div);
    element = document.createElement("div");if(modal){element.setAttribute("id", `family_progressbar`);}else{element.setAttribute("id", `profile_progressbar`);}element.setAttribute("class", "progress-bar p-1");element.setAttribute("role", "progressbar");element.setAttribute("aria-valuemin", "0");element.setAttribute("aria-valuemax", "100");
    div.appendChild(element);
    return container;
}

async function populateProfileAccuracy(profileId, modal){
    let id = "profile_";
    if(modal) id = "family_";
    const profileStatistics = await Api.getProfileStatisticsById(profileId);
    if(profileStatistics.faces === 0) profileStatistics.faces = 1;
    const value = parseFloat(100 * profileStatistics.recognized / profileStatistics.faces).toFixed(2);
    const progressbar = document.getElementById(`${id}progressbar`);
    progressbar.setAttribute("aria-valuenow", value);
    progressbar.innerText = `${value}%`;
    if(value > 80){progressbar.classList.add("bg-primary");}
    else if(value > 60){progressbar.classList.add("bg-success");}
    else if(value > 40){progressbar.classList.add("bg-info");}
    else if(value > 20){progressbar.classList.add("bg-warning");}
    else {progressbar.classList.add("bg-danger");}
    if(value < 5) progressbar.setAttribute("style", `text-align: left;width: 5%`);
    else progressbar.setAttribute("style", `text-align: left;width: ${value}%`);
}

function familyListItem(loggedProfile, profile){
    const img = document.createElement("img");
    img.setAttribute("id", `family_list_item_${profile.profileId}`);
    img.setAttribute("class", "avatar-overlay img-respinsive col-sm-6 col-md-6 col-lg-2 mb-4");
    img.setAttribute("src", profile.avatar);
    img.setAttribute("data-toggle", "modal");
    img.setAttribute("data-target", "#family_modal");
    img.addEventListener("click", () => {populateFamilyModal(loggedProfile, profile);});
    return img;
}

function createFamilyModal(){
    const modal = document.createElement("div");modal.setAttribute("id", "family_modal");modal.setAttribute("class", "modal fade");modal.setAttribute("tabindex", "-1");modal.setAttribute("role", "dialog");modal.setAttribute("aria-labelledby", "modalFamilyLabel");modal.setAttribute("aria-hidden", "true");
    const doc = document.createElement("div");doc.setAttribute("class", "modal-dialog modal-dialog-scrollable modal-lg");doc.setAttribute("role", "document");modal.appendChild(doc);
    const content = document.createElement("div");content.setAttribute("class", "modal-content");doc.appendChild(content);
    // modal header
    const header = document.createElement("div");header.setAttribute("class", "modal-header");content.appendChild(header);
    const title = document.createElement("h5");title.setAttribute("id", "family_title");title.setAttribute("class", "modal-title title");header.appendChild(title);
    let element = document.createElement("button");element.setAttribute("id", "family_close");element.setAttribute("class", "close");element.setAttribute("type", "button");element.setAttribute("data-dismiss", "modal");element.setAttribute("aria-label", "Close");element.innerHTML = `<span aria-hidden="true">&times;</span>`;header.appendChild(element);
    // modal body
    const body = document.createElement("div");body.setAttribute("class", "modal-body");content.appendChild(body);
    let div = document.createElement("div");div.setAttribute("class", "p-2 m-2");body.appendChild(div);
    div.appendChild(createProfile(true));
    div.appendChild(createProfileAccuracy(true));
    // modal footer
    const footer = document.createElement("div");footer.setAttribute("class", "modal-footer justify-content-between");content.appendChild(footer);
    element = document.createElement("button");element.setAttribute("id", "family_edit");element.setAttribute("class", "btn btn-outline-primary btn-rounded btn-md ml-4");element.setAttribute("type", "button");element.setAttribute("data-dismiss", "modal");element.setAttribute("data-toggle", "modal");element.setAttribute("data-target", "#edit_modal");element.innerHTML = `<i class="fa fa-edit mr-2"></i>Edit this profile`;footer.appendChild(element);
    return modal;
}

async function populateFamilyModal(loggedProfile, profile){
    document.getElementById("family_title").innerHTML = `<i class="fa fa-user mr-2"></i>${profile.firstName} ${profile.lastName}`;
    await populateProfile(loggedProfile, profile);
    await populateProfileAccuracy(profile.profileId, true);
    document.getElementById("family_edit").addEventListener("click", () => {populateEditModal(loggedProfile, profile);});
}

export {loadHome, loadRecognize, loadProfile, loadAboutUs};