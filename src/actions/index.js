import * as api from '../api';
import * as issue from '../constants/issueConstants';
import * as label from '../constants/labelConstants';
import * as repo from '../constants/reposConstants';
import {
  ADD_TO_SELECTED_LABELS,
  REMOVE_FROM_SELECTED_LABELS,
  EMPTY_SELECTED_LABELS
} from '../constants/selectedLabelsConstants';

export const getIssues = (org, repo, label) => async (dispatch) => {
  dispatch({
    type: issue.GET_ISSUES_REQUEST
  });
  try {
    const { data } = await api.fetchIssues(org, repo, label);
    dispatch({
      type: issue.GET_ISSUES_SUCCESS,
      payload: data
    });
  } catch (e) {
    dispatch({
      type: issue.GET_ISSUES_FAIL,
      error: e.message
    });
  }
};

export const toggleLabelList = (menu) => (dispatch) => {
  if (menu === 1) menu = 2;
  else menu = 1;
  dispatch({
    type: label.TOGGLE_MENU,
    menu
  });
};

export const epmtyIssuesList = () => (dispatch) => {
  dispatch({
    type: issue.EMPTY_ISSUES_LIST
  });
};

export const epmtySelectedLabel = () => (dispatch) => {
  dispatch({
    type: EMPTY_SELECTED_LABELS
  });
};

export const setLanguage = (language) => (dispatch) => {
  dispatch({
    type: issue.SET_LANGUAGE,
    language
  });
};

export const rawLabels = async (repos, dispatch) => {
  let rawdata = [];
  let labels;
  for (let i = 0; i < repos.length; i++) {
    const item = repos[i];
    try {
      labels = await api.fetchLabels(item.org, item.repo);
    } catch (e) {
      console.error(e);
    }
    for (let j = 0; j < labels.data.length; j++) {
      const label = labels.data[j];
      rawdata.push(label.name);
    }
    dispatch({
      type: label.GET_LABELS_REQUEST,
      loadingPercentage: (i * 100) / repos.length
    });
  }
  return rawdata;
};

export const getLabels = (repos) => async (dispatch, getState) => {
  if (repos === undefined) return;
  dispatch({
    type: label.GET_LABELS_REQUEST,
    loadingPercentage: 0
  });
  try {
    // get date for list of labels, saved in browser's local strorage
    const localDataDate = localStorage.getItem('date');
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    today = (mm + dd + yyyy).toString();
    // if date, when data was saved, is more than a day, clear it.
    if (localDataDate !== today) {
      localStorage.removeItem('labelslist');
      localStorage.removeItem('date');
    }

    // get label list from local storage
    const localData = localStorage.getItem('labelslist');
    let data = '';
    if (localData) data = JSON.parse(localData);
    else data = await rawLabels(repos, dispatch); // if label list is not present in local storage than get fresh list of labels.
    dispatch({
      type: label.GET_LABELS_SUCCESS,
      payload: data
    });
    localStorage.setItem('labelslist', JSON.stringify(getState().labelsStore.labelslist));
    localStorage.setItem('date', today);
  } catch (e) {
    console.error(`getlabels error ${e.message}`);
    dispatch({
      type: label.GET_LABELS_FAIL,
      error: e.message
    });
  }
};

export const getRepos = () => async (dispatch) => {
  dispatch({
    type: repo.GET_REPOS_REQUEST
  });
  try {
    const { data } = await api.fetchRepos();
    dispatch({
      type: repo.GET_REPOS_SUCCESS,
      payload: data
    });
  } catch (e) {
    dispatch({
      type: repo.GET_REPOS_FAIL,
      error: e.message
    });
  }
};

export const addToSelectedLabels = (labels) => (dispatch) => {
  dispatch({
    type: ADD_TO_SELECTED_LABELS,
    payload: labels
  });
};

export const removeFromSelectLabels = (labels) => (dispatch) => {
  dispatch({
    type: REMOVE_FROM_SELECTED_LABELS,
    payload: labels
  });
};
