import * as Api from './api.js';
import * as Main from './main.js';
import Profile from "./profile.js";
import ProfileStatistics from "./profilestatistics.js";

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
    element = document.createElement("input");element.setAttribute("id", "edit_upload");element.setAttribute("name", "avatar");element.setAttribute("class", "custom-file-input");element.setAttribute("type", "file");element.setAttribute("style", "cursor: pointer;");input.setAttribute("accept", ".png, .jpg, .jpeg, .svg");input.appendChild(element);
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
    const span = document.createElement("span");span.setAttribute("id", "edit_notification_adv");span.setAttribute("class", "notification-adv text-warning");span.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>Yellow fields are mandatory</b>`;
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

function populateEditModal(profile){
    const newProfile = (typeof profile === 'string' || profile instanceof String);
    if (newProfile){
        document.getElementById("edit_title").innerHTML = `<i class="fa fa-user-plus mr-2"></i>Create new profile`;
        document.getElementById("edit_avatar").setAttribute("src", profile);
    } else {
        document.getElementById("edit_title").innerHTML = `<i class="fa fa-edit mr-2"></i>Edit profile`;
        document.getElementById("edit_avatar").setAttribute("src", `/faces/${profile.avatar}`);
        document.getElementById("edit_firstname").value = profile.firstName;
        document.getElementById("edit_firstname").classList.replace("border-warning", "border-success");
        document.getElementById("edit_lastname").value = profile.lastName;
        document.getElementById("edit_phone").value = profile.phone;
        document.getElementById("edit_phone").classList.replace("border-warning", "border-success");
        if(profile.notificationsPhone){document.getElementById("edit_phonebutton").classList.replace("fa-bell-slash", "fa-bell");}
        else {document.getElementById("edit_phonebutton").classList.replace("fa-bell", "fa-bell-slash");}
        document.getElementById("edit_mail").value = profile.email;
        if(profile.email != "" && profile.notificationsEmail){document.getElementById("edit_mailbutton").classList.replace("fa-bell-slash", "fa-bell");}
        else {document.getElementById("edit_mailbutton").classList.replace("fa-bell", "fa-bell-slash");}
        document.getElementById("edit_system").childNodes.forEach(child => {if(child.innerText === profile.system)document.getElementById("edit_system").value = child.value;});
        document.getElementById("edit_system").classList.replace("border-warning", "border-success");
        document.getElementById("edit_family").childNodes.forEach(child => {if(child.innerText === profile.family)document.getElementById("edit_family").value = child.value;});
    }
    document.getElementById("edit_save").addEventListener("click", () => {submitEditModal(profile);});
    document.getElementById("edit_upload").addEventListener('change', readFile, false);
}

function readFile(){
    // file checks
    if (this.files && this.files[0]) {
        // file type
        if (!this.files[0].type.match(/image.*/)) {
            document.getElementById("edit_notification_adv").classList.remove("text-warning", "text-secondary");
            document.getElementById("edit_notification_adv").classList.add("show", "text-danger");
            document.getElementById("edit_notification_adv").innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>Only jpg, pgn and png images are allowed</b>`;
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
    document.getElementById("edit_notification_adv").classList.remove("show");
}

async function submitEditModal(profile){
    const updateProfile = !(typeof profile === 'string' || profile instanceof String);
    if(document.getElementById("edit_firstname").classList.contains("border-warning") || document.getElementById("edit_phone").classList.contains("border-warning") || document.getElementById("edit_system").classList.contains("border-warning")){
        document.getElementById("edit_notification_adv").classList.remove("text-warning", "text-secondary");document.getElementById("edit_notification_adv").classList.add("show", "text-danger");document.getElementById("edit_notification_adv").innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>Yellow fields are mandatory</b>`;
        return;
    }
    let avatar = document.getElementById("edit_avatar").getAttribute("src").split("/")[document.getElementById("edit_avatar").getAttribute("src").split("/").length-1];
    if(document.getElementById('edit_upload').files[0]){
        avatar = await Api.uploadNewAvatarImage(document.getElementById('edit_upload').files[0], `${document.getElementById("edit_firstname").value}${document.getElementById("edit_phone").value}`);
        avatar = avatar.directory;
        if(updateProfile) await Api.deleteAvatar(profile.avatar);
    } else {
        if(updateProfile) avatar = profile.avatar;
        else {
            //TODO: avatar = await Api.moveImage(avatar, `${document.getElementById("edit_firstname").value}${document.getElementById("edit_phone").value}`);
            await Api.deleteStranger(avatar);
        }
    }    
    const newProfile = new Profile(
        document.getElementById("edit_firstname").value,document.getElementById("edit_lastname").value,
        document.getElementById("edit_phone").value,document.getElementById("edit_mail").value,"","",
        document.getElementById("edit_phonebutton").classList.contains("fa-bell") || document.getElementById("edit_mailbutton").classList.contains("fa-bell"),
        document.getElementById("edit_phonebutton").classList.contains("fa-bell"),document.getElementById("edit_mailbutton").classList.contains("fa-bell"),
        avatar
    );
    document.getElementById("edit_system").childNodes.forEach(child => {if(document.getElementById("edit_system").value === child.value)newProfile.system = child.innerText;});
    document.getElementById("edit_family").childNodes.forEach(child => {if(document.getElementById("edit_family").value === child.value)newProfile.family = child.innerText;});
    $("#edit_modal").modal("toggle");
    if(updateProfile){
        await Api.updateProfile(newProfile);
        Main.loadProfile();
    } else {
        await Api.newProfile(newProfile);
        await Api.newProfileStatistics(new ProfileStatistics(newProfile.profileId));
        Main.loadRecognize();
    };
}

function createProfile(id){
    const profile = document.createElement("div");profile.setAttribute("id", id);profile.setAttribute("class", "row align-items-center justify-content-start");
    let div = document.createElement("div");div.setAttribute("id", `${id}_avatar`);div.setAttribute("class", "card overflow-hidden col-md-4 col-lg-3 avatar");profile.appendChild(div);
    let element = document.createElement("img");element.setAttribute("id", `${id}_image`);element.setAttribute("class", "card-img img-responsive");div.appendChild(element);
    div = document.createElement("ul");div.setAttribute("class", "col-md-8 col-lg-9 justify-content-start");profile.appendChild(div);
    element = document.createElement("li");div.appendChild(element);
    let span = document.createElement("span");span.setAttribute("id", `${id}_notifications_main`);span.setAttribute("class", "notification notification-main mb-2");span.classList.add("text-secondary");span.innerHTML = `<i class="fa fa-bell-slash mr-3"></i>`;element.appendChild(span);
    element = document.createElement("b");element.setAttribute("id", `${id}_notifications_main_text`);element.innerText = `Notifications`;span.appendChild(element);
    element = document.createElement("li");div.appendChild(element);
    span = document.createElement("span");span.setAttribute("id", `${id}_notifications_phone`);span.setAttribute("class", "notification mb-2");span.classList.add("text-secondary");span.innerHTML = `<i class="fa fa-phone-slash mr-3"></i>`;element.appendChild(span);
    element = document.createElement("b");element.setAttribute("id", `${id}_notifications_phone_text`);element.innerText = `Phone`;span.appendChild(element);
    element = document.createElement("li");div.appendChild(element);
    span = document.createElement("span");span.setAttribute("id", `${id}_notifications_email`);span.setAttribute("class", "notification mb-2");span.classList.add("text-secondary");span.innerHTML = `<i class="fa fa-envelope-open mr-3"></i>`;element.appendChild(span);
    element = document.createElement("b");element.setAttribute("id", `${id}_notifications_email_text`);element.innerText = `Email`;span.appendChild(element);
    element = document.createElement("li");div.appendChild(element);
    span = document.createElement("span");span.setAttribute("id", `${id}_notifications_adv`);span.setAttribute("class", "notification-adv text-danger");span.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>You can enable/disable phone and email notifications separately</b>`;element.appendChild(span);
    element = document.createElement("b");element.setAttribute("id", `${id}_notifications_adv_text`);element.innerText = `ADV`;span.appendChild(element);
    element = document.createElement("li");element.setAttribute("class", "mt-2");div.appendChild(element);
    span = document.createElement("button");span.setAttribute("id", `${id}_system`);span.setAttribute("class", "btn btn-secondary btn-rounded");span.innerText = `System role`;element.appendChild(span);
    span = document.createElement("button");span.setAttribute("id", `${id}_family`);span.setAttribute("class", "btn btn-info btn-rounded btn-md ml-3");span.innerText = `Family role`;element.appendChild(span);
    return profile;
}

function populateProfile(loggedProfile, profile){
    let id = "profile";
    if(loggedProfile.profileId != profile.profileId) id = "family";
    const prodileAvatar = document.getElementById(`${id}_avatar`);
    const notificationsMain = document.getElementById(`${id}_notifications_main`);
    const notificationsPhone = document.getElementById(`${id}_notifications_phone`);
    const notificationsPhoneText = document.getElementById(`${id}_notifications_phone_text`);
    const notificationsEmail = document.getElementById(`${id}_notifications_email`);
    const notificationsEmailText = document.getElementById(`${id}_notifications_email_text`);
    const notificationsAdv = document.getElementById(`${id}_notifications_adv`);
    const profileSystem = document.getElementById(`${id}_system`);
    const profileFamily = document.getElementById(`${id}_family`);
    // if profile is inside a modal
    if(id === "profile"){
        prodileAvatar.setAttribute("data-toggle", "modal");
        prodileAvatar.setAttribute("data-target", "#edit_modal");
        prodileAvatar.addEventListener("click", () => {populateEditModal(loggedProfile)});
        const editButton = document.createElement("span");editButton.setAttribute("class", "text-primary");editButton.setAttribute("data-toggle", "modal");editButton.setAttribute("data-target", "#edit_modal");editButton.innerHTML = `<i class="fa fa-edit mr-2"></i>`;editButton.addEventListener("click", () => {populateEditModal(profile)});prodileAvatar.appendChild(editButton);}
    else {prodileAvatar.setAttribute("class", `col-md-4 col-lg-3 mb-2`);}
    // fill fields
    document.getElementById(`${id}_title`).innerHTML = `<i class="fa fa-user mr-3"></i>${profile.firstName} ${profile.lastName}`;
    document.getElementById(`${id}_image`).setAttribute("src", `/faces/${profile.avatar}`);
    notificationsPhoneText.innerText = profile.phone;
    if(profile.email == "") notificationsEmail.setAttribute("display", "none"); else notificationsEmailText.innerText = profile.email;
    if(profile.notifications){notificationsMain.classList.replace("text-secondary", "text-primary");notificationsMain.firstChild.classList.replace("fa-bell-slash", "fa-bell");showAdv("warning", notificationsMain.getAttribute("id").split("_")[0]);}
    if(profile.notificationsPhone){notificationsPhone.classList.replace("text-secondary", "text-primary");notificationsPhone.firstChild.classList.replace("fa-phone-slash", "fa-phone");}
    if(profile.notificationsEmail){notificationsEmail.classList.replace("text-secondary", "text-primary");notificationsEmail.firstChild.classList.replace("fa-envelope-open", "fa-envelope");}
    profileSystem.innerText = profile.system;
    if(profile.family == "") profileFamily.setAttribute("style", "visibility: hidden"); else profileFamily.innerText = profile.family;
    // listeners
    notificationsMain.addEventListener("click", () => {
        const modal = notificationsMain.getAttribute("id").split("_")[0] === "family";
        if(notificationsMain.firstChild.classList.contains("fa-bell")){
            notificationsMain.classList.replace("text-primary", "text-secondary");notificationsMain.firstChild.classList.replace("fa-bell", "fa-bell-slash");
            notificationsPhone.classList.replace("text-primary", "text-secondary");notificationsPhone.firstChild.classList.replace("fa-phone", "fa-phone-slash");
            if(notificationsEmail.getAttribute("display") !== "none"){
                notificationsEmail.classList.replace("text-primary", "text-secondary");notificationsEmail.firstChild.classList.replace("fa-envelope", "fa-envelope-open");
            }
            showAdv("warning", id);
        } else {
            notificationsMain.classList.replace("text-secondary", "text-primary");notificationsMain.firstChild.classList.replace("fa-bell-slash", "fa-bell");
            notificationsPhone.classList.replace("text-secondary", "text-primary");notificationsPhone.firstChild.classList.replace("fa-phone-slash", "fa-phone");
            if(profile.email != ""){
                notificationsEmail.classList.replace("text-secondary", "text-primary");notificationsEmail.firstChild.classList.replace("fa-envelope-open", "fa-envelope");
            }
        }
        const newProfile = new Profile(profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, 
            !notificationsMain.firstChild.classList.contains("fa-bell-slash"), !notificationsPhone.firstChild.classList.contains("fa-phone-slash"), !notificationsEmail.firstChild.classList.contains("fa-envelope-open"), profile.avatar);
        Api.updateProfile(newProfile);
        showAdv("warning", id);
        if(id === "profile")loggedProfile = newProfile;else profile = newProfile;
    });
    notificationsPhone.addEventListener("click", () => {
        const modal = notificationsPhone.getAttribute("id").split("_")[0] === "family";
        if(notificationsMain.firstChild.classList.contains("fa-bell-slash"))
            showAdv("danger", id);
        else {
            if(notificationsPhone.firstChild.classList.contains("fa-phone-slash")){
                notificationsPhone.classList.replace("text-secondary", "text-primary");notificationsPhone.firstChild.classList.replace("fa-phone-slash", "fa-phone");
            } else {
                notificationsPhone.classList.replace("text-primary", "text-secondary");notificationsPhone.firstChild.classList.replace("fa-phone", "fa-phone-slash");
            }
            const newProfile = new Profile(profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, 
                !notificationsMain.firstChild.classList.contains("fa-bell-slash"), !notificationsPhone.firstChild.classList.contains("fa-phone-slash"), !notificationsEmail.firstChild.classList.contains("fa-envelope-open"), profile.avatar);
            Api.updateProfile(newProfile);
            showAdv("warning", id);
            if(id === "profile")loggedProfile = newProfile;else profile = newProfile;
        }
    });
    notificationsEmail.addEventListener("click", () => {
        const modal = notificationsEmail.getAttribute("id").split("_")[0] === "family";
        if(notificationsMain.firstChild.classList.contains("fa-bell-slash"))
            showAdv("danger", id);
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
            showAdv("warning", id);
            if(id === "profile")loggedProfile = newProfile;else profile = newProfile;
        }
    });
    notificationsAdv.addEventListener("click", () => {notificationsAdv.classList.toggle("show");});
    profileSystem.addEventListener("click", () => {showAdv("info", profileSystem.getAttribute("id").split("_")[0]);});
    profileFamily.addEventListener("click", () => {showAdv("info", profileFamily.getAttribute("id").split("_")[0]);});
}

function showAdv(message, id){
    const adv = document.getElementById(`${id}_notifications_adv`);adv.classList.remove("text-secondary", "text-warning", "text-danger");adv.classList.toggle("show");
    switch(message){
        case "info":{adv.classList.add("text-secondary");adv.innerHTML = `<i class="fas fa-info mr-3"></i><b>These badges specify the roles related to this user for the system and the family and to which priviledges it has access</b>`;break;}
        case "warning":{adv.classList.add("text-warning");adv.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>You can enable/disable phone and email notifications separately</b>`;break;}
        case "danger":{adv.classList.add("show", "text-danger");adv.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>You need to turn on notifications first</b>`;break;}
        default:{adv.classList.remove("show", "text-danger");adv.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>ADV OPTION ERROR -> message: ${message}</b>`;break;}
    }
}

function createProfileAccuracy(id){
    const container = document.createElement("div");container.setAttribute("id", `${id}_accuracy`);container.setAttribute("class", "row align-items-center justify-content-around pt-2");
    let div = document.createElement("span");div.setAttribute("class", "col-12 text-secondary");container.appendChild(div);
    let element = document.createElement("b");element.innerText = `Algorithm performance`;div.appendChild(element);
    element = document.createElement("div");element.setAttribute("class", "col-12");container.appendChild(element);
    div = document.createElement("div");div.setAttribute("class", "progress");div.setAttribute("style", "height: 2em;");element.appendChild(div);
    element = document.createElement("div");element.setAttribute("id", `${id}_progressbar`);element.setAttribute("class", "progress-bar p-1");element.setAttribute("role", "progressbar");element.setAttribute("aria-valuemin", "0");element.setAttribute("aria-valuemax", "100");
    div.appendChild(element);
    return container;
}

async function populateProfileAccuracy(profileId, id){
    const profileStatistics = await Api.getProfileStatisticsById(profileId);
    if(profileStatistics.faces === 0) profileStatistics.faces = 1;
    const value = parseFloat(100 * (profileStatistics.faces - profileStatistics.unrecognized) / profileStatistics.faces).toFixed(2);
    const progressbar = document.getElementById(`${id}_progressbar`);
    progressbar.setAttribute("aria-valuenow", value);
    progressbar.innerText = `${value}%`;
    if(value > 80){progressbar.classList.add("bg-primary");}
    else if(value > 60){progressbar.classList.add("bg-success");}
    else if(value > 40){progressbar.classList.add("bg-info");}
    else if(value > 20){progressbar.classList.add("bg-warning");}
    else if(value <= 20){progressbar.classList.add("bg-danger");}
    if(value < 5 || isNaN(value)) progressbar.setAttribute("style", `text-align: left;width: 5%`);
    else progressbar.setAttribute("style", `text-align: left;width: ${value}%`);
}

function familyListItem(loggedProfile, profile){
    const card = document.createElement("div");
    card.setAttribute("id", `select_${profile.profileId}`);
    card.setAttribute("class", "card avatar-overlay overflow-hidden");
    card.setAttribute("data-toggle", "modal");
    card.setAttribute("data-target", "#family_modal");
    card.addEventListener("click", () => {populateFamilyModal(loggedProfile, profile);});
    const img = document.createElement("img");
    img.setAttribute("id", `family_list_item_${profile.profileId}`);
    img.setAttribute("class", "card-img");
    img.setAttribute("src", `/faces/${profile.avatar}`);
    card.appendChild(img);
    return card;
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
    div.appendChild(createProfile("family"));
    div.appendChild(createProfileAccuracy("family"));
    // modal footer
    const footer = document.createElement("div");footer.setAttribute("class", "modal-footer justify-content-between");content.appendChild(footer);
    element = document.createElement("button");element.setAttribute("id", "family_edit");element.setAttribute("class", "btn btn-outline-primary btn-rounded btn-md ml-4");element.setAttribute("type", "button");element.setAttribute("data-dismiss", "modal");element.setAttribute("data-toggle", "modal");element.setAttribute("data-target", "#edit_modal");element.innerHTML = `<i class="fa fa-edit mr-2"></i>Edit this profile`;footer.appendChild(element);
    return modal;
}

async function populateFamilyModal(loggedProfile, profile){
    document.getElementById("family_title").innerHTML = `<i class="fa fa-user mr-2"></i>${profile.firstName} ${profile.lastName}`;
    await populateProfile(loggedProfile, profile);
    await populateProfileAccuracy(profile.profileId, "family");
    document.getElementById("family_edit").addEventListener("click", () => {populateEditModal(profile);});
}

export {createEditModal, populateEditModal, createProfile, populateProfile, createProfileAccuracy, populateProfileAccuracy, familyListItem, createFamilyModal};