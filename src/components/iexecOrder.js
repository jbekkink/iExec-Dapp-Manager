import {uploadFailed, uploadSuccessful, loadingNotif} from './Notifications';
import toast from 'react-hot-toast';

const publishOrder = (iexec, app_address, app_price, app_volume, nft_restrict) => async () => {
  const loading = loadingNotif('Publishing order...');
    try {
      const app = app_address;
      const appprice = app_price;
      const volume = app_volume
      const datasetrestrict = nft_restrict;
      const tag = "0x0000000000000000000000000000000000000000000000000000000000000000";
      const signedOrder = await iexec.order.signApporder(
        await iexec.order.createApporder({
          app,
          appprice,
          volume,
          datasetrestrict,
          tag
        })
      );
      const orderHash = await iexec.order.publishApporder(signedOrder);
      toast.dismiss(loading);
      return orderHash;

    } catch (error) {
      toast.dismiss(loading);
      throw Error(error);
    } 
};

const showOrderbook = (iexec, app_address, datasetrestrict) => async () => {
  try {
    const res = await iexec.orderbook.fetchAppOrderbook(app_address, {dataset: datasetrestrict});
    return res;
  } catch (error) {
    throw Error(error);
  } 
};

const unpublishOrder = (iexec, orderHash) => async () => {
  const loading = loadingNotif('Unpublishing order...');
  try {
    await iexec.order.unpublishApporder(orderHash);
    toast.dismiss(loading);
  } catch (error) {
    toast.dismiss(loading);
    throw Error(error);
  } 
};

export {publishOrder, showOrderbook, unpublishOrder};
