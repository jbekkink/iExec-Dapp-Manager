import toast from 'react-hot-toast';

function loadingNotif(text) {
    toast.loading(text, {position: 'bottom-right' , 
    style: {
        background: '#111115',
        color: 'white',
        padding: '0.5em',
        border: '1px solid #322c3c',
        borderRadius: '5px'
    },
    iconTheme: {
        primary: '#FFEA61',
        secondary: '#202020',
    },
  });
}

function uploadSuccessful(text) {
    toast.success(text, {position: 'top-right' , 
    style: {
        background: '#111115',
        color: 'white',
        padding: '1.5em',
        border: '1px solid #322c3c',
        borderRadius: '5px'
        },
        iconTheme: {
            primary: '#FFEA61',
            secondary: '#202020',
          },
          duration: 2000,
        
    });
}

function uploadFailed(text) {
    toast.error(text, {position: 'top-right' , 
    style: {
        background: '#111115',
        color: 'white',
        padding: '1.5em',
        border: '1px solid #322c3c',
        borderRadius: '5px'
        },
        duration: 2000,
    });
}

function copyToClipBoard(text) {
    toast(text, {
        id: 'clipboard',
        position: 'bottom-right',
        style: {
            background: '#111115',
            display: 'block',
            color: 'white',
            padding: '0.5em',
            border: '1px solid #322c3c',
            borderRadius: '5px'
        }, 
        duration: 750
      });
}

export {uploadSuccessful, loadingNotif, uploadFailed, copyToClipBoard};