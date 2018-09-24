const util = require('util');
const execPromise = util.promisify(require('child_process').exec);
const { exec } = require('child_process');

const serviceDetails = [
  {
    'url-key': 'CASE_URL',
    'service-name': 'rm-case-service'
  },
  {
    'url-key': 'COLLECTION_EXERCISE_URL',
    'service-name': 'rm-collection-exercise-service'
  },
  {
    'url-key': 'COLLECTION_INSTRUMENT_URL',
    'service-name': 'ras-collection-instrument'
  },
  {
    'url-key': 'IAC_URL',
    'service-name': 'iac-service'
  },
  {
    'url-key': 'OAUTH_URL',
    'service-name': 'django-oauth2-test'
  },
  {
    'url-key': 'PARTY_URL',
    'service-name': 'ras-party'
  },
  {
    'url-key': 'SECURE_MESSAGE_URL',
    'service-name': 'ras-secure-message'
  },
  {
    'url-key': 'SURVEY_URL',
    'service-name': 'rm-survey-service'
  },



  {
    'url-key': 'UAA_SERVICE_URL',
    'service-name': 'uaa'
  },
  {
    'url-key': 'SAMPLE_URL',
    'service-name': 'rm-sample-service'
  }
];

//ACCOUNT_SERVICE_URL=https://surveys.ons.gov.uk/surveys/todo

const basicAuthUsernameKeys = [
  'SECURITY_USER_NAME',
  'CASE_USERNAME',
  'COLLECTION_EXERCISE_USERNAME',
  'COLLECTION_INSTRUMENT_USERNAME',
  'IAC_USERNAME',
  'PARTY_USERNAME',
  'SURVEY_USERNAME'
];

const basicAuthPwKeys = [
  'SECURITY_USER_PASSWORD',
  'CASE_PASSWORD',
  'COLLECTION_EXERCISE_PASSWORD',
  'COLLECTION_INSTRUMENT_PASSWORD',
  'IAC_PASSWORD',
  'PARTY_PASSWORD',
  'SURVEY_PASSWORD'
];

const argMap = {
  'basic-auth-username': null,
  'basic-auth-password': null,
  'service-suffix': null,
  'port': null,
  'docker-image': null,
  'python-path': null,
  'install': null,
  'run-with': null,
  'jwt': null
};

process.argv.forEach((arg) => {
  Object.keys(argMap).forEach((k) => {
    if(arg.includes('--' + k)) {
      argMap[k] = arg.replace('--' + k + '=', '')
    }
  });
});

console.log('argMap: ', argMap);


/**
 * Prerequisites
 */
const dockerRedis = (opts = {}) => {
  const command = opts.run
    ? 'docker run --name redis ' +
    (argMap['run-with'] === 'docker' ? '-p 7379:6379 ' : '-p 6379:6379 ') +
    '-d redis'
    : 'docker start redis';

  return execPromise(command);
};


/**
 * Run for development
 */
function dev() {
  console.log('Running with pipenv');

  const pipEnvInstallCommand = 'pipenv install --python=' + argMap["python-path"];

  const pipEnvInstall = () => {
    exec(pipEnvInstallCommand, {maxBuffer: 1024 * 500}, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(stdout);
      pipRAS();
    }).stdout.pipe(process.stdout);
  };

  const pipRASCommand =
    serviceDetails.map((details) => {
      return details['url-key'] + '=https://' + details['service-name'] + argMap['service-suffix'];
    }).join(' ') + ' ' +
    basicAuthUsernameKeys.map((k) => {
      return k + '=' + argMap["basic-auth-username"];
    }).join(' ') + ' ' +
    basicAuthPwKeys.map((k) => {
      return k + '=' + argMap["basic-auth-password"];
    }).join(' ') + ' ' +

    /**
     * Both are the same but have different environment variables in different
     * applications
     */
    'JWT_SECRET=' + argMap.jwt + ' ' +
    'RAS_SECURE_MESSAGING_JWT_SECRET=' + argMap.jwt + ' ' +

    'ACCOUNT_SERVICE_URL=https://surveys.ons.gov.uk/surveys/todo ' +
    'pipenv run python run.py';

  const pipRAS = () => {
    exec(pipRASCommand, {maxBuffer: 1024 * 500}, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(stdout);
    }).stdout.pipe(process.stdout);
  }

  function routeFromArgs() {
    if (argMap.install) {
      pipEnvInstall();
    }
    else {
      pipRAS();
    }
  }

  routeFromArgs();
}


/**
 * Run with docker
 */
function docker() {
  console.log('Running with Docker');

  const dockerRASCommand = 'docker run -d -p ' + argMap.port + ':' + argMap.port + ' --link redis:redis ' +
    serviceDetails.map((details) => {
      return '-e ' + details['url-key'] + '=https://' + details['service-name'] + argMap['service-suffix'];
    }).join(' ') + ' ' +
    basicAuthUsernameKeys.map((k) => {
      return '-e ' + k + '=' + argMap["basic-auth-username"];
    }).join(' ') + ' ' +
    basicAuthPwKeys.map((k) => {
      return '-e ' + k + '=' + argMap["basic-auth-password"];
    }).join(' ') + ' ' +

    '-e JWT_SECRET=' + argMap.jwt + ' ' +
    '-e REDIS_HOST=redis -e REDIS_PORT=6379 -e REDIS_DB=3 ' +
    '-e ACCOUNT_SERVICE_URL=https://surveys.ons.gov.uk/surveys/todo ' +
    argMap['docker-image'];

  const dockerRAS = () => {
    exec(dockerRASCommand, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(stdout);
    });
  };

  dockerRAS();
}



/**
 * Init
 */
function init() {
  return new Promise((resolve, reject) => {
    exec(`docker inspect redis`, {maxBuffer: 1024 * 500}, (err, stdout, stderr) => {
      const state = JSON.parse(stdout)[0] && JSON.parse(stdout)[0].State;

      if(err || stderr) {
        console.log(err, stderr);
        dockerRedis({run: true}).then(() => resolve());
        return;
      }

      if (state) {
        console.log('Container with named state redis exists');

        if(!state.Running) {
          console.log('Run existing redis container');
          dockerRedis().then(() => resolve());
        }
        else {
          resolve();
        }
      }
      else {
        console.log('Container with named state redis does not exist');
        dockerRedis({run: true}).then(() => resolve());
      }
      //console.log(stdout);
    });
  });
}

init().then(argMap['run-with'] === 'docker' ? docker() : dev());
