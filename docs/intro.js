try {
  const files = readFiles(['file1', 'file2']);
  deleteFiles(files);
  console.log('Files deleted');
} catch(err) {
  console.error(err);
}

function readFiles(names) {
  if(somethingBadHappened) {
    throw new Error('Something crashed');
  } else {
    return files;
  }
}

readFiles(['file1', 'file2'], (err, files) => {
  if(err) {
    return console.error(err);
  }
  deleteFiles(files, (err) => {
    if(err) {
      return console.error(err);
    }
    console.log('Files deleted');
  });
});


function readFiles(names, callback) {
  if(somethingBadHappened) {
    callback(new Error('Something crashed'));
  } else {
    callback(null, files);
  }
}


readFiles(['file1', 'file2'])
  .on('COMPLETE', (files) => {
    deleteFiles(files)
      .on('COMPLETE', () => {
        console.log('Files deleted')
      })
      .on('ERROR', (err) => {
        console.error(err);
      });
  })
  .on('ERROR', (err) => {
    console.error(err);
  });


function readFiles(names) {
  const emitter = new EventEmitter();
  if(somethingBadHappened) {
    emitter.emit('ERROR', new Error('Something crashed'));
  } else {
    emitter.emit('COMPLETE', files);
  }
  return emitter;
}

readFiles(['file1', 'file2'])
  .then((files) => {
    return deleteFiles(files)
  })
  .then(() => {
    console.log('Files deleted')
  })
  .catch((err) => {
    console.error(err);
  });


function readFiles(names) {
  return new Promise((resolve, reject) => {
    if(somethingBadHappened) {
      reject(new Error('Something crashed'));
    } else {
      resolve(files);
    }
  })
}

async function doReadFiles() {
  try {
    const files = await readFiles(['file1', 'file2']);
    await deleteFiles(files);
    console.log('Files deleted');
  } catch(err) {
    console.error(err);
  }
}




