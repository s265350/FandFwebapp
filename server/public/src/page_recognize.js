import * as Api from './api.js';
import * as Main from './main.js';
import * as P_profile from './page_profile.js';

// creates ad div html element containing the modal
function createRecognizeModal(){
    const modal = document.createElement('div');modal.setAttribute('id', 'recognize_modal');modal.setAttribute('class', 'modal fade');modal.setAttribute('role', 'dialog');modal.setAttribute('aria-labelledby', 'selectionModal');modal.setAttribute('data-backdrop', 'static');modal.setAttribute('data-keyboard', 'false');
    const doc = document.createElement('div');doc.setAttribute('class', 'modal-dialog modal-dialog-scrollable modal-lg');doc.setAttribute('role', 'document');modal.appendChild(doc);
    const content = document.createElement('div');content.setAttribute('class', 'modal-content');doc.appendChild(content);
    // modal header
    const header = document.createElement('div');header.setAttribute('class', 'modal-header');content.appendChild(header);
    const title = document.createElement('h5');title.setAttribute('class', 'modal-title title');title.innerHTML = `<i class='fa fa-question mr-3'></i>Is part of the family`;header.appendChild(title);
    let element = document.createElement('button');element.setAttribute('type', 'button');element.setAttribute('class', 'close');element.setAttribute('data-dismiss', 'modal');element.setAttribute('aria-label', 'Close');element.innerHTML = `<span aria-hidden='true'>&times;</span>`;element.addEventListener('click', () => {clearRecognizeModal();});header.appendChild(element);
    // modal body
    const body = document.createElement('div');body.setAttribute('class', 'modal-body');content.appendChild(body);
    const div = document.createElement('div');div.setAttribute('class', 'p-2 m-2');body.appendChild(div);
    let row = document.createElement('div');row.setAttribute('class', 'row justify-content-center m-1');div.appendChild(row);
    element = document.createElement('img');element.setAttribute('id', 'recognize_avatar');element.setAttribute('class', 'col-md-4 col-lg-5 img-respinsive mb-2');row.appendChild(element);
    element = document.createElement('p');element.setAttribute('class', 'subtitle text-dark pt-4');element.innerText = `Select`;div.appendChild(element);
    div.appendChild(document.createElement('hr'));
    const selection = document.createElement('div');selection.setAttribute('id', 'selection');selection.setAttribute('class', 'card-columns');div.appendChild(selection);
    // modal footer
    const footer = document.createElement('div');footer.setAttribute('class', 'modal-footer justify-content-between');content.appendChild(footer);
    element = document.createElement('button');element.setAttribute('id', 'recognize_save');element.setAttribute('type', 'button');element.setAttribute('class', 'btn btn-outline-primary btn-rounded btn-md ml-4');element.setAttribute('data-dismiss', 'modal');element.setAttribute('data-target', '#recognize_modal');element.innerHTML = `<i class='fa fa-times-circle mr-2'></i>Close`;footer.appendChild(element);
    element = document.createElement('button');element.setAttribute('id', 'recognize_new');element.setAttribute('type', 'button');element.setAttribute('class', 'btn btn-outline-primary btn-rounded btn-md ml-4');element.setAttribute('data-dismiss', 'modal');element.setAttribute('data-toggle', 'modal');element.setAttribute('data-target', '#edit_modal');element.innerHTML = `<i class='fa fa-user-plus mr-2'></i>Create new profile`;footer.appendChild(element);
    return modal;
}

// creates ad div html element containing the card image
async function recognizeListItem(imgName){
    const card = document.createElement('div');
    card.setAttribute('class', 'card avatar-overlay overflow-hidden');
    card.setAttribute('data-toggle', 'modal');
    card.setAttribute('data-target', '#recognize_modal');
    card.addEventListener('click', () => {populateRecognizeModal(imgName);});
    const img = document.createElement('img');
    img.setAttribute('class', 'card-img');
    const image = await Api.getImage(imgName, true);
    img.setAttribute('src', image);
    card.appendChild(img);
    return card;
}

async function populateRecognizeModal(imgName){
    // avatar
    const image = await Api.getImage(imgName, true);
    document.getElementById('recognize_avatar').setAttribute('src', image);
    // selection list
    const profiles = await Api.getAllProfiles();
    for(let i=0; i<profiles.length; i++){document.getElementById('selection').appendChild(await profileListItem(profiles[i]));}
    // save button
    document.getElementById('recognize_save').addEventListener('click', () => {
        submitRecognizeModal(imgName);
        clearRecognizeModal();
    });
    // new profile button
    document.getElementById('recognize_new').addEventListener('click', () => {
        P_profile.populateEditModal(imgName);
        clearRecognizeModal();
    });
}

function clearRecognizeModal(){
    document.getElementById('selection').innerHTML = ``;
    document.getElementById('recognize_save').innerHTML = `<i class='fa fa-times-circle mr-2'></i>Close`;
}

// updates statistics and delete the image
async function submitRecognizeModal(imgName){
    let profileId = undefined;
    document.getElementById('selection').childNodes.forEach(card => {if(card.classList.contains('selected')){profileId = card.getAttribute('id').split('_')[1];}});
    if(profileId){
        const profileStatistics = await Api.getProfileStatisticsById(profileId);
        profileStatistics.faces++;
        profileStatistics.unrecognized++;
        await Api.updateProfileStatistics(profileStatistics);
        await Api.deleteImage(imgName, true);
        Main.loadRecognize();
    }
}

// creates ad div html element containing the card image
async function profileListItem(profile){
    const card = document.createElement('div');
    card.setAttribute('id', `select_${profile.profileId}`);
    card.setAttribute('class', 'card avatar-overlay overflow-hidden');
    card.addEventListener('click', () => {
        card.classList.toggle('border-primary');
        card.classList.toggle('selected');
        document.querySelector('#selection').childNodes.forEach(card => {if(card.getAttribute('id') !== `select_${profile.profileId}`){card.classList.remove('selected', 'border-primary');}});
        document.getElementById('recognize_save').innerHTML = `<i class='fa fa-times-circle mr-2'></i>Close`;
        document.querySelector('#selection').childNodes.forEach(card => {if(card.classList.contains('selected')){document.getElementById('recognize_save').innerHTML = `<i class='fa fa-save mr-2'></i>Save`;}});
    });
    const img = document.createElement('img');
    img.setAttribute('class', 'card-img');
    const image = await Api.getImage(profile.avatar, false);
    img.setAttribute('src', image);
    card.appendChild(img);
    return card;
}

export {createRecognizeModal, recognizeListItem};