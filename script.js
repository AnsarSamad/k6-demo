import http from 'k6/http';
import { check, sleep, group } from 'k6'
import { Rate } from 'k6/metrics';
import encoding from 'k6/encoding'
import { fail } from 'k6'


export let errorRate = new Rate('API_ERROR');



/* read config file */
var config = JSON.parse(open('./config/config.json'));
/* read request data file */
var request_data_global = JSON.parse(open('./config/request.json'));

export let options = config.options;

/* Life cycle method, called only onece for a test
   Setup is called at the beginning of the test, after the init stage but before the VU stage 
   data (JSON) returned from setup will be used for VU (default code) code and teardown code
   */

export function setup() {
  //1. get auth token
  //2. form requestData [] - contains request base url , request sample data (generate dynamic values)

  var auth_data = getAuthToken();
  var request_data = getRequestData();
  return { auth_data, request_data };
}

const getAuthToken = () => {
  const encoded_credential = encoding.b64encode(config.oauth_username + ":" + config.oauth_password);
  const params = {
    headers: {
      'Authorization': 'Basic ' + encoded_credential,
      'Content-Type': 'application/json'
    }
  }
  // let token_response = http.post(config.oauth_token_url, null, params);
  // console.log('token_Response:' + JSON.stringify(token_response))
  // if (token_response) {
  //   let access_token = token_response['access_token']
  //   let token_expires = token_response['expires_in']
  //   return { access_token, token_expires, token_start_time: Date.now() }
  // }
  // return null;
  return { access_token: '123', token_expires: '5', token_start_time: Date.now() }
}

const getRequestData = () => {
  var request_data_array = [];
  var input_apis = __ENV.apis;
  for (let api of input_apis.split(',')) {
    let api_config = config.api_details[`${api}`];
    let api_request_data = request_data_global[`${api}`];
    api_request_data = setDynamicData(api_config, api_request_data);
    request_data_array.push({ url: `${config.api_base_path}/${api_config.url}`, api_request_data })
  }
  return request_data_array;
}

const setDynamicData = (api_config, request_data) => {
  if (api_config.capability_name == "transaction") {
    var random = Math.floor(Math.random() * (99999 - 1)) + 1;
    request_data.transactionDetails.transactionSequenceNumber = random;
    request_data.transactionDetails.storeCode = api_config.store_code;
    request_data.transactionDetails.storeId = api_config.store_id;
    request_data.transactionDetails.registerId = Math.floor(Math.random() * (99 - 1)) + 1;
    request_data.transactionDetails.businessdDate = api_config.business_date;
  }
  return request_data;
}

export default function (data) {
  console.log('am in VU')
  validateToken(data.auth_data);
  getAPIData(data);
  sleep(3)
}

const validateToken = (auth_data) => {
  // if(auth_data){
  //   let timeLeft = Date.now() - auth_data.token_start_time ;
  //   if( timeLeft - auth_data.token_expires > 30000){ //buffer
  //     return auth_data;
  //   }
  // }
  // return getAuthToken();
}

const getAPIData = (data) => {
  // console.log('making request to API')
  // const params = {
  //   headers: {
  //     'Authorization': 'Bearer ' + data.auth_data.access_token,
  //     'Content-Type': 'application/json'
  //   }
  // }
  // for(let api of data.request_data){
  //   let api_response = http.post(api.url, api.api_request_data, params);
  //   validateResponse(api_response);
  // }  
}

const validateResponse = (api_response) => {
  console.log('validating API response')
}
