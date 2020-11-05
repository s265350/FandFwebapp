import Profile from "./profile.js";

window.addEventListener("load", () => {
    /* LOGIN */
    document.getElementById("sideHome").onclick = loadHome;
    document.getElementById("sideRecognize").onclick = loadRecognize;
    document.getElementById("sideProfile").onclick = loadProfile;
    document.getElementById("sideAboutUs").onclick = loadAboutUs;
    loadHome();
    const video = document.getElementById("webcam");
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) { video.srcObject = stream; })
            .catch(function (err0r) { console.log("Video stream error: " + err0r); });
    }
});

function loadHome(){
    /* SIDEMENU */
    document.querySelectorAll(".nav-link").forEach(a => {a.classList.remove("active");});
    document.getElementById("sideHome").classList.add("active");
    /* MAIN */
    document.getElementById("videowrap").classList.remove("video");
    document.getElementById("content").innerHTML = "";
    /* FUNCTIONS */
}

function loadRecognize(){
    /* SIDEMENU */
    document.querySelectorAll(".nav-link").forEach(a => {a.classList.remove("active");});
    document.getElementById("sideRecognize").classList.add("active");
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
    const paragraph = document.createElement("p");
    paragraph.setAttribute("class", "title text-dark");
    paragraph.innerHTML = `<i class="fa fa-question mr-3"></i>I don't recognize those faces`;
    container.appendChild(paragraph);
    container.appendChild(document.createElement("hr"));
    // list
    const list = document.createElement("div");
    list.setAttribute("id", "recognize_list");
    list.setAttribute("class", "row align-items-center justify-content-start");
    container.appendChild(list);
    // list items
    //TODO: db call
    list.appendChild(recognizeListItem("svg/avatar.svg"));
    list.appendChild(recognizeListItem("svg/avatar.svg"));
}

function recognizeListItem(imgPath){
    let img = document.createElement("img");
    img.setAttribute("id", "recognize_"+imgPath);
    img.setAttribute("class", "avatar-overlay img-respinsive col-sm-4 col-md-3 col-lg-3 mb-4");
    img.setAttribute("src", imgPath);
    img.setAttribute("data-toggle", "modal");
    img.setAttribute("data-target", "#recognize_modal");
    img.addEventListener("click", () => {document.getElementById("container").appendChild(createRecognizeForm(imgPath));});
    return img;
}

function createRecognizeForm(imgPath){
    const modal = document.createElement("div");modal.setAttribute("id", "recognize_modal");modal.setAttribute("class", "modal fade");modal.setAttribute("role", "dialog");modal.setAttribute("aria-labelledby", "selectionModal");modal.setAttribute("data-backdrop", "static");modal.setAttribute("data-keyboard", "false");
    const doc = document.createElement("div");doc.setAttribute("class", "modal-dialog modal-dialog-scrollable modal-lg");doc.setAttribute("role", "document");modal.appendChild(doc);
    const content = document.createElement("div");content.setAttribute("class", "modal-content");doc.appendChild(content);
    // modal header
    const header = document.createElement("div");header.setAttribute("class", "modal-header");content.appendChild(header);
    const title = document.createElement("h5");title.setAttribute("id", "recognize_title");title.setAttribute("class", "modal-title title");title.innerHTML = `<i class="fa fa-question mr-3"></i>Is part of the family`;header.appendChild(title);
    let element = document.createElement("button");element.setAttribute("type", "button");element.setAttribute("class", "close");element.setAttribute("data-dismiss", "modal");element.setAttribute("aria-label", "Close");element.innerHTML = `<span aria-hidden="true">&times;</span>`;
    element.addEventListener("click", () => {
        document.getElementById("selection").childNodes.forEach(div => {div.firstChild.classList.remove("selected");});
        document.getElementById("container").removeChild(document.getElementById("recognize_modal"));
    });
    header.appendChild(element);
    // modal body
    const body = document.createElement("div");body.setAttribute("class", "modal-body");content.appendChild(body);
    const div = document.createElement("div");div.setAttribute("class", "p-4 m-4");body.appendChild(div);
    const row = document.createElement("div");row.setAttribute("class", "row justify-content-center m-1");div.appendChild(row);
    element = document.createElement("img");element.setAttribute("id", "recognize_avatar");element.setAttribute("class", "col-sm-7 col-md-6 col-lg-5 img-respinsive mb-2");element.setAttribute("src", imgPath);row.appendChild(element);
    const selection = document.createElement("div");selection.setAttribute("id", "selection");selection.setAttribute("class", "row justify-content-start m-1");div.appendChild(selection);
    // fill list
    //TODO: db call
    selection.appendChild(recognizeProfileListItem(new Profile("profile1", "firstName", "lastName", "1234567890", "email", "Adult", "Father", true, true, false, "svg/avatar.svg")));
    selection.appendChild(recognizeProfileListItem(new Profile("profile2", "firstName", "lastName", "1234567890", "email", "Adult", "Father", true, true, false, "svg/avatar.svg")));
    // modal footer
    const footer = document.createElement("div");footer.setAttribute("class", "modal-footer justify-content-between");content.appendChild(footer);
    element = document.createElement("button");element.setAttribute("id", "recognize_save");element.setAttribute("type", "button");element.setAttribute("class", "btn btn-outline-primary btn-rounded btn-md ml-4");element.setAttribute("data-dismiss", "modal");element.setAttribute("data-target", "#recognize_modal");element.innerHTML = `<i class="fa fa-times-circle mr-2"></i>Close`;
    element.addEventListener("click", () => {
        if(document.getElementById("recognize_save").firstChild.classList.contains("fa-save")){
            document.getElementById("selection").childNodes.forEach(div => {
                if(div.firstChild.classList.contains("selected")){
                    const selected = div.getAttribute("id").split("_")[1];
                    console.log(selected);
                    //TODO: db call
                }
            });
            document.getElementById("recognize_list").removeChild(document.getElementById("recognize_"+imgPath));
        }
        document.getElementById("container").removeChild(document.getElementById("recognize_modal"));
    });
    footer.appendChild(element);
    element = document.createElement("button");element.setAttribute("id", "recognize_new");element.setAttribute("type", "button");element.setAttribute("class", "btn btn-outline-primary btn-rounded btn-md ml-4");element.setAttribute("data-dismiss", "modal");element.setAttribute("data-toggle", "modal");element.setAttribute("data-target", "#edit_modal");element.innerHTML = `<i class="fa fa-user-plus mr-2"></i>Create new profile`;
    element.addEventListener("click", () => {
        document.getElementById("container").appendChild(createEditForm(imgPath));
        document.getElementById("container").removeChild(document.getElementById("recognize_modal"));
    });
    footer.appendChild(element);
    return modal;
}

function recognizeProfileListItem(profile){
    const container = document.createElement("div");
    container.setAttribute("id", "select_"+profile.profileId);
    container.setAttribute("class", "col-sm-6 col-md-4 col-lg-3 mb-4");
    let img = document.createElement("img");
    img.setAttribute("class", "avatar-overlay img-respinsive border-primary");
    img.setAttribute("src", profile.avatar);
    img.addEventListener("click", () => {
        img.classList.toggle("selected");
        document.querySelector("#selection").childNodes.forEach(div => {
            if(div.getAttribute("id") !== "select_"+profile.profileId){
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

function createEditForm(profile){
    const modal = document.createElement("div");modal.setAttribute("id", "edit_modal");modal.setAttribute("class", "modal fade");modal.setAttribute("tabindex", "-1");modal.setAttribute("role", "dialog");modal.setAttribute("aria-labelledby", "editModal");modal.setAttribute("aria-hidden", "true");modal.setAttribute("data-backdrop", "static");modal.setAttribute("data-keyboard", "false");
    const doc = document.createElement("div");doc.setAttribute("class", "modal-dialog modal-dialog-scrollable modal-lg");doc.setAttribute("role", "document");modal.appendChild(doc);
    const content = document.createElement("div");content.setAttribute("class", "modal-content");doc.appendChild(content);
    // modal header
    const header = document.createElement("div");header.setAttribute("class", "modal-header");content.appendChild(header);
    const title = document.createElement("h5");title.setAttribute("id", "edit_title");title.setAttribute("class", "modal-title title");header.appendChild(title);if (typeof profile === 'string' || profile instanceof String){title.innerHTML = `<i class="fa fa-user-plus mr-2"></i>Create new profile`;} else {title.innerHTML = `<i class="fa fa-edit mr-2"></i>Edit`;}header.appendChild(title);
    let element = document.createElement("button");element.setAttribute("type", "button");element.setAttribute("class", "close");element.setAttribute("data-dismiss", "modal");element.setAttribute("aria-label", "Close");element.innerHTML = `<span aria-hidden="true">&times;</span>`;element.onclick = function(){document.getElementById("container").removeChild(document.getElementById("edit_modal"));};header.appendChild(element);
    // modal body
    const body = document.createElement("div");body.setAttribute("class", "modal-body");content.appendChild(body);
    let div = document.createElement("div");div.setAttribute("class", "p-2 m-2");body.appendChild(div);
    let row = document.createElement("div");row.setAttribute("class", "row align-items-center justify-content-around p-1 m-1");div.appendChild(row);
    const form =  document.createElement("form");form.setAttribute("id", "edit_form");row.appendChild(form);
    const form_row =  document.createElement("div");form_row.setAttribute("class", "form-row");form.appendChild(form_row);
    div =  document.createElement("div");div.setAttribute("class", "col-md-5 col-lg-4");form_row.appendChild(div);
    let group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    element = document.createElement("img");element.setAttribute("id", "edit_avatar");element.setAttribute("class", "img-rounded img-respinsive mb-2");if (typeof profile === 'string' || profile instanceof String){element.setAttribute("src", profile);} else {element.setAttribute("src", profile.avatar);}group.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    let input = document.createElement("div");input.setAttribute("class", "custom-file");group.appendChild(input);
    element = document.createElement("input");element.setAttribute("id", "edit_upload");element.setAttribute("class", "custom-file-input");element.setAttribute("type", "file");input.appendChild(element);
    element = document.createElement("label");element.setAttribute("class", "custom-file-label");element.setAttribute("for", "edit_upload");element.innerHTML = `<i class="fa fa-image mr-2"></i>Upload photo`;input.appendChild(element);
    div =  document.createElement("div");div.setAttribute("class", "col-md-7 col-lg-8");form_row.appendChild(div);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    input = document.createElement("div");input.setAttribute("class", "input-group");group.appendChild(input);
    element = document.createElement("input");element.setAttribute("id", "edit_firstname");element.setAttribute("class", "form-control border-warning");element.setAttribute("type", "text");element.setAttribute("placeholder", "First name*");if(typeof profile === 'string' || profile instanceof String){element.value = ""}else{element.value = profile.firstName;}
    element.onkeyup = function(){
        if(document.getElementById("edit_firstname").value.length === 0) document.getElementById("edit_firstname").classList.add("border-warning");
        else document.getElementById("edit_firstname").classList.remove("border-warning");
    };
    input.appendChild(element);
    element = document.createElement("input");element.setAttribute("id", "edit_lastname");element.setAttribute("class", "form-control");element.setAttribute("type", "text");element.setAttribute("placeholder", "Last name");if(typeof profile === 'string' || profile instanceof String){element.value = ""}else{element.value = profile.lastName;}input.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    input = document.createElement("div");input.setAttribute("class", "input-group");group.appendChild(input);
    element = document.createElement("input");element.setAttribute("id", "edit_phone");element.setAttribute("class", "form-control border-warning");element.setAttribute("type", "tel");element.setAttribute("placeholder", "Phone number");if(typeof profile === 'string' || profile instanceof String){element.value = ""}else{element.value = profile.phone;}
    element.onkeyup = function(){
        if(document.getElementById("edit_phone").value.length <= 8) document.getElementById("edit_phone").classList.add("border-warning");
        else document.getElementById("edit_phone").classList.remove("border-warning");
    };
    input.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "input-group-append");input.appendChild(group);
    element = document.createElement("button");element.setAttribute("class", "btn btn-secondary");element.setAttribute("type", "button");if(typeof profile === 'string' || profile instanceof String){element.innerHTML = `<i id="edit_phonebutton" class="fa fa-bell-slash"></i>`;}else{if(profile.notificationPhone)element.innerHTML = `<i id="edit_phonebutton" class="fa fa-bell-slash"></i>`;elseelement.innerHTML = `<i id="edit_phonebutton" class="fa fa-bell-slash"></i>`;};
    element.addEventListener("click", () => {
        document.getElementById("edit_phonebutton").classList.toggle("fa-bell-slash");
        document.getElementById("edit_phonebutton").classList.toggle("fa-bell");
    });
    group.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    input = document.createElement("div");input.setAttribute("class", "input-group");group.appendChild(input);
    group = document.createElement("div");group.setAttribute("class", "input-group-prepend");input.appendChild(group);
    element = document.createElement("span");element.setAttribute("class", "input-group-text");element.innerText = `@`;group.appendChild(element);
    element = document.createElement("input");element.setAttribute("id", "edit_mail");element.setAttribute("class", "form-control");element.setAttribute("type", "text");element.setAttribute("placeholder", "E-mail address");element.setAttribute("aria-label", "Username");element.setAttribute("aria-describedby", "basic-addon1");if(typeof profile === 'string' || profile instanceof String){element.value = ""}else{element.value = profile.email;}input.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "input-group-append");input.appendChild(group);
    element = document.createElement("button");element.setAttribute("class", "btn btn-secondary");element.setAttribute("type", "button");if(typeof profile === 'string' || profile instanceof String){element.innerHTML = `<i id="edit_mailbutton" class="fa fa-bell-slash"></i>`;}else{if(profile.notificationsEmail)element.innerHTML = `<i id="edit_mailbutton" class="fa fa-bell-slash"></i>`;elseelement.innerHTML = `<i id="edit_mailbutton" class="fa fa-bell-slash"></i>`;};
    element.addEventListener("click", () => {
        document.getElementById("edit_mailbutton").classList.toggle("fa-bell-slash");
        document.getElementById("edit_mailbutton").classList.toggle("fa-bell");
    });
    group.appendChild(element);
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    input = document.createElement("div");input.setAttribute("class", "input-group");group.appendChild(input);
    group = document.createElement("div");group.setAttribute("class", "input-group-prepend");input.appendChild(group);
    element = document.createElement("label");element.setAttribute("class", "input-group-text");element.setAttribute("for", "edit_systemrole");element.innerText = `System role`;group.appendChild(element);
    group = document.createElement("select");group.setAttribute("id", "edit_system");group.setAttribute("class", "custom-select border-warning");
    group.onchange = function(){
        if(document.getElementById("edit_system").value == 0) document.getElementById("edit_system").classList.add("border-warning");
        else document.getElementById("edit_system").classList.remove("border-warning");
    };
    input.appendChild(group);
    element = document.createElement("option");element.setAttribute("value", "0");element.innerText = `Choose...*`;element.selected = true;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "1");element.innerText = `Admin`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "2");element.innerText = `Adult`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "3");element.innerText = `Minor`;group.appendChild(element);
    if(typeof profile === 'string' || profile instanceof String){group.value = 0}else{group.childNodes.forEach(child => {if(child.innerText === profile.system)group.value = child.getAttribute("value");});};
    group = document.createElement("div");group.setAttribute("class", "form-group");div.appendChild(group);
    input = document.createElement("div");input.setAttribute("class", "input-group");group.appendChild(input);
    group = document.createElement("div");group.setAttribute("class", "input-group-prepend");input.appendChild(group);
    element = document.createElement("label");element.setAttribute("class", "input-group-text");element.setAttribute("for", "edit_familyrole");element.innerText = `Family role`;group.appendChild(element);
    group = document.createElement("select");group.setAttribute("id", "edit_family");group.setAttribute("class", "custom-select");input.appendChild(group);
    element = document.createElement("option");element.setAttribute("value", "0");element.innerText = `Choose...`;element.selected = true;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "1");element.innerText = `Father`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "2");element.innerText = `Mother`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "3");element.innerText = `Son`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "4");element.innerText = `Daughter`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "5");element.innerText = `Male Friend`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "6");element.innerText = `Female Friend`;group.appendChild(element);
    element = document.createElement("option");element.setAttribute("value", "7");element.innerText = `Other`;group.appendChild(element);
    if(typeof profile === 'string' || profile instanceof String){group.value = 0}else{group.childNodes.forEach(child => {if(child.innerText === profile.family)group.value = child.getAttribute("value");});};
    div = document.createElement("div");div.setAttribute("class", "col-12");form.appendChild(div);
    const span = document.createElement("span");span.setAttribute("id", "edit_notification_adv");
    span.setAttribute("class", "notification-adv  text-warning show");
    span.innerHTML = `<i class="fa fa-times-circle mr-2"></i><b>Yellow fields are mandatory</b>`;
    span.addEventListener("click", () => {span.classList.remove("show")});
    div.appendChild(span);
    // modal footer
    const footer = document.createElement("div");footer.setAttribute("class", "modal-footer justify-content-start");content.appendChild(footer);
    element = document.createElement("button");element.setAttribute("id", "edit_save");element.setAttribute("type", "button");element.setAttribute("class", "btn btn-outline-primary btn-rounded btn-md ml-4");element.innerHTML = `<i class="fa fa-save mr-2"></i>Save`;
    element.addEventListener("click", () => {
        if(document.getElementById("edit_firstname").value.length === 0 ||
            document.getElementById("edit_phone").value.length <= 8 ||
            document.getElementById("edit_system").value == 0){
                document.getElementById("edit_notification_adv").classList.remove("text-warning");
                document.getElementById("edit_notification_adv").classList.add("text-danger");
                document.getElementById("edit_notification_adv").classList.add("show");
        } else {
            const profile = new Profile(
                document.getElementById("edit_firstname").value + document.getElementById("edit_phone").value,
                document.getElementById("edit_firstname").value,
                document.getElementById("edit_lastname").value,
                document.getElementById("edit_phone").value,
                document.getElementById("edit_mail").value,
                document.getElementById("edit_system").innerText,
                document.getElementById("edit_family").innerText,
                document.getElementById("edit_phonebutton").classList.contains("fa-bell") || document.getElementById("edit_mailbutton").classList.contains("fa-bell"),
                document.getElementById("edit_phonebutton").classList.contains("fa-bell"),
                document.getElementById("edit_mailbutton").classList.contains("fa-bell"),
                document.getElementById("edit_avatar").getAttribute("src")
            );
            //TODO: db call
            console.log(profile);
            document.getElementById("edit_form").reset();
            document.getElementById("edit_phonebutton").classList.remove("fa-bell");
            document.getElementById("edit_phonebutton").classList.add("fa-bell-slash");
            document.getElementById("edit_mailbutton").classList.remove("fa-bell");
            document.getElementById("edit_mailbutton").classList.add("fa-bell-slash");
            if(typeof profile === 'string' || profile instanceof String){
                document.getElementById("recognize_list").removeChild(document.getElementById("recognize_"+profile));
            }else{};
            $('#edit_modal').modal('toggle');
            document.getElementById("container").removeChild(document.getElementById("edit_modal"));
        }
    });
    footer.appendChild(element);
    return modal;
}

function loadProfile(){
    /* SIDEMENU */
    document.querySelectorAll(".nav-link").forEach(a => {a.classList.remove("active");});
    document.getElementById("sideProfile").classList.add("active");
    /* MAIN */
    document.getElementById("videowrap").classList.add("video");
     document.getElementById("webcam").addEventListener("click", () => {loadHome()});
    document.getElementById("content").innerHTML = `
        <img class="img-fluid" src="svg/polito.png">
        <div id="profile" class="p-4 m-4">
            <p id="profile_title" class="title text-dark"><i class="fa fa-user mr-2"></i>Full name</p>
            <hr>
            <div class="row align-items-center justify-content-around p-1 m-1">
                <div class="avatar col-md-4 col-lg-3 mb-2">
                    <img id="profile_avatar" class="img-rounded img-respinsive" src="svg/avatar.svg">
                    <span class="overlay text-primary" data-toggle="modal" data-target="#edit_modal"><i class="fa fa-edit mr-2"></i></span>
                </div>
                <ul class="col-md-8 col-lg-9 justify-content-start">
                    <li><span id="profile_notification_main" class="mb-2 notification notification-main text-secondary"><i class="fa fa-bell mr-3"></i><b>Notifications</b></span></li>
                    <li><span id="profile_notification_phone" class="mb-2 notification text-secondary"><i class="fa fa-phone mr-3"></i><b id="profile_phone">Phone Notifications</b></span></li>
                    <li><span id="profile_notification_mail" class="mb-2 notification text-secondary"><i class="fa fa-envelope mr-3"></i><b id="profile_mail">E-mail Notifications</b></span></li>
                    <li><span id="profile_notification_adv" class="notification-adv text-danger"><i class="fa fa-times-circle mr-2"></i><b>You need to turn on notifications first</b></span></li>
                    <li class="mt-2">
                        <button id="profile_system" class="btn btn-secondary btn-rounded" data-toggle="modal" data-target="#info_modal">System role</button>
                        <button id="profile_family" class="btn btn-info btn-rounded btn-md ml-3" data-toggle="modal" data-target="#info_modal">Family role</button>
                    </li>
                </ul>
            </div>
            <div class="row align-items-center justify-content-around pt-2">
                <span class="col-12 text-secondary"><b>Algorithm performance</b></span>
                <div class="col-12"><div class="progress" style="height: 2em;"><div class="progress-bar p-1" role="progressbar" style="width: 90%;text-align: left;" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100">90%</div></div></div>
            </div>
            <p class="subtitle text-dark pt-4"><i class="fa fa-home mr-2"></i>Family</p>
            <hr>
            <div class="row align-items-center justify-content-start">
                <img class="avatar-overlay img-respinsive col-sm-6 col-md-6 col-lg-2 mb-4" src="svg/avatar.svg" data-toggle="modal" data-target="#family_modal">
            </div>
        </div>
        <div class="modal fade" id="info_modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-md" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="info_title" class="modal-title title"><i class="fa fa-info mr-3"></i>Role badges</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body mb-0 p-0">
                        <p id="info_text" class="text-secondary p-2 m-2">These badges specify the roles related to this user for the system and the family and to which priviledges it has access.</p>
                    </div>
                </div>
            </div>
        </div>
        <!-- EDIT MODAL -->
        <div class="modal fade" id="family_modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="family_title" class="modal-title title"><i class="fa fa-user mr-2"></i>Full name</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body mb-0 p-0">
                        <div id="family_profile" class="p-4 m-4">
                            <div class="row align-items-center justify-content-around p-1 m-1">
                                <img class="img-rounded img-respinsive col-md-5 col-lg-4 mb-2" src="svg/avatar.svg">
                                <ul class="col-md-7 col-lg-8 justify-content-start">
                                    <li><span id="family_notification" class="mb-2 text-secondary notification notification-general notification-checked"><i class="fa fa-bell mr-3"></i><b>Notifications</b></span></li>
                                    <li><span id="family_notification" class="mb-2 text-secondary notification"><i class="fa fa-phone mr-3"></i><b>Phone Notifications</b></span></li>
                                    <li><span id="family_notification" class="mb-2 text-secondary notification"><i class="fa fa-envelope mr-3"></i><b>E-mail Notifications</b></span></li>
                                    <li><span id="family_notification_adv" class="notification-adv text-danger"><i class="fa fa-times-circle mr-2"></i><b>You need to turn on notifications first</b></span></li>
                                    <li class="mt-2"><button class="btn btn-secondary btn-rounded">System role</button><button class="btn btn-info btn-rounded btn-md ml-3">Family role</button></li>
                                </ul>
                            </div>
                            <div class="row align-items-center justify-content-around pt-2">
                                <span class="col-12 text-secondary"><b>Algorithm performance</b></span>
                                <div class="col-12"><div class="progress" style="height: 2em;"><div id="family_progress" class="progress-bar p-1" role="progressbar" style="width: 90%;text-align: left;" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100">90%</div></div></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-between">
                        <button id="family_edit" type="button" class="btn btn-outline-primary btn-rounded btn-md ml-4" data-dismiss="modal" data-toggle="modal" data-target="#edit_modal"><i class="fa fa-edit mr-2"></i>Edit this profile</button>
                    </div>
                </div>
            </div>
        </div>`;
    /* FUNCTIONS */
    // notifications
    const notification_main = document.getElementById("profile_notification_main");
    const notification_phone = document.getElementById("profile_notification_phone");
    const notification_email = document.getElementById("profile_notification_mail");
    const notification_adv = document.getElementById("profile_notification_adv");
    const adv_danger = "You need to turn on notifications first";
    const adv_warning = "To receive phone or email notifications click on the icons";
    
    notification_main.addEventListener("click", () => {
        notification_main.classList.toggle("text-secondary");
        notification_main.classList.toggle("text-primary");
        notification_adv.classList.remove("show");
        if(notification_main.classList.contains("text-secondary") && notification_phone.classList.contains("text-primary")){
            notification_phone.classList.remove("text-primary");
            notification_phone.classList.add("text-secondary");
        }
        if(notification_main.classList.contains("text-secondary") && notification_email.classList.contains("text-primary")){
            notification_email.classList.remove("text-primary");
            notification_email.classList.add("text-secondary");
        }
        if(notification_main.classList.contains("text-primary") && notification_phone.classList.contains("text-secondary") && notification_email.classList.contains("text-secondary")){
            notification_adv.classList.add("show");
            notification_adv.classList.remove("text-danger");
            notification_adv.classList.add("text-warning");
            notification_adv.lastChild.innerText = adv_warning;
        }
    });
    notification_phone.addEventListener("click", () => {
        if(notification_main.classList.contains("text-secondary")){
            notification_adv.classList.add("show");
            notification_adv.classList.remove("text-warning");
            notification_adv.classList.add("text-danger");
            notification_adv.lastChild.innerText = adv_danger;
        }else{
            notification_phone.classList.toggle("text-secondary");
            notification_phone.classList.toggle("text-primary");
            notification_adv.classList.remove("show");
        }
        if(notification_main.classList.contains("text-primary") && notification_phone.classList.contains("text-secondary") && notification_email.classList.contains("text-secondary")){
            notification_adv.classList.add("show");
            notification_adv.classList.remove("text-danger");
            notification_adv.classList.add("text-warning");
            notification_adv.lastChild.innerText = adv_warning;
        }
    });
    notification_email.addEventListener("click", () => {
        if(notification_main.classList.contains("text-secondary")){
            notification_adv.classList.add("show");
            notification_adv.classList.remove("text-warning");
            notification_adv.classList.add("text-danger");
            notification_adv.lastChild.innerText = adv_danger;
        }else{
            notification_email.classList.toggle("text-secondary");
            notification_email.classList.toggle("text-primary");
            notification_adv.classList.remove("show");
        }
        if(notification_main.classList.contains("text-primary") && notification_phone.classList.contains("text-secondary") && notification_email.classList.contains("text-secondary")){
            notification_adv.classList.add("show");
            notification_adv.classList.remove("text-danger");
            notification_adv.classList.add("text-warning");
            notification_adv.lastChild.innerText = adv_warning;
        }
    });
    notification_adv.addEventListener("click", () => {
        notification_adv.classList.remove("show");
    });

    // progress bar
    const progress = document.querySelector(".progress-bar");
    if(progress.getAttribute("aria-valuenow") >= 80)
        progress.classList.add("bg-primary");
    else if(progress.getAttribute("aria-valuenow") >= 60)
        progress.classList.add("bg-success");
    else if(progress.getAttribute("aria-valuenow") >= 40)
        progress.classList.add("bg-info");
    else if(progress.getAttribute("aria-valuenow") >= 20)
        progress.classList.add("bg-warning");
    else if(progress.getAttribute("aria-valuenow") >= 0)
        progress.classList.add("bg-danger");

    // edit modal
    document.getElementById("edit_mailbutton").addEventListener("click", () => {
        document.getElementById("edit_mailbutton").firstChild.classList.toggle("fa-bell-slash");
        document.getElementById("edit_mailbutton").firstChild.classList.toggle("fa-bell");
    });
    document.getElementById("edit_phonebutton").addEventListener("click", () => {
        document.getElementById("edit_phonebutton").firstChild.classList.toggle("fa-bell-slash");
        document.getElementById("edit_phonebutton").firstChild.classList.toggle("fa-bell");
    });
}

function loadAboutUs(){
    /* SIDEMENU */
    document.querySelectorAll(".nav-link").forEach(a => {a.classList.remove("active");});
    document.getElementById("sideAboutUs").classList.add("active");
    /* HTML */
    document.getElementById("videowrap").classList.add("video");
    document.getElementById("webcam").addEventListener("click", () => {loadHome()});
    const content = document.getElementById("content");
    content.innerHTML = "";
    // top image
    let img = document.createElement("img");
    img.setAttribute("class", "img-fluid");
    img.setAttribute("src", "svg/polito.png");
    content.appendChild(img);
    // container
    const div_outer = document.createElement("div");
    div_outer.setAttribute("class", "p-4 m-4");
    content.appendChild(div_outer);
    // title
    let p = document.createElement("p");
    p.setAttribute("class", "title text-dark");
    p.innerHTML = `<i class="fas fa-info mr-3"></i>Who we are`;
    div_outer.appendChild(p);
    div_outer.appendChild(document.createElement("hr"));
    // body
    const div_inner = document.createElement("div");
    div_inner.setAttribute("class", "row p-1 m-1");
    div_outer.appendChild(div_inner);
    p = document.createElement("p");
    p.setAttribute("class", "text-secondary");
    p.innerHTML = `Hi, we are a group of students of 
        <a class="text-info" style="text-decoration: none;" href="https://www.polito.it/" target="_blank">Politecnico di Torino</a> 
        and this is an homework for the course Image Processing And Computer Vision.`;
    div_inner.appendChild(p);
    p = document.createElement("p");
    p.setAttribute("class", "text-secondary");
    p.innerHTML = `The goal of this web application is to test the facerecognition python library, emulating a domestic video surveillance system`;
    div_inner.appendChild(p);
    p = document.createElement("p");
    p.setAttribute("class", "text-secondary");
    p.innerHTML = `Please contact us for any question or problem via email at: S123456@studenti.polito.it`;
    div_inner.appendChild(p);
}