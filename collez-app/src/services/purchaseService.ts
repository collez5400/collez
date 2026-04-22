import { Platform } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';

export type PurchaseProduct = {
  productId: string;
  title: string;
  description: string;
  price: string;
};

function isIapSupportedPlatform() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function connectIapAsync() {
  if (!isIapSupportedPlatform()) return false;
  await InAppPurchases.connectAsync();
  const responseCode = await InAppPurchases.getBillingResponseCodeAsync();
  return responseCode === InAppPurchases.IAPResponseCode.OK;
}

export async function disconnectIapAsync() {
  if (!isIapSupportedPlatform()) return;
  await InAppPurchases.disconnectAsync();
}

export async function getProductsAsync(productIds: string[]): Promise<PurchaseProduct[]> {
  if (!isIapSupportedPlatform() || productIds.length === 0) return [];
  const result = await InAppPurchases.getProductsAsync(productIds);
  if (result.responseCode !== InAppPurchases.IAPResponseCode.OK) {
    return [];
  }

  return (result.results ?? []).map((item) => ({
    productId: item.productId,
    title: item.title,
    description: item.description,
    price: item.price,
  }));
}

export async function purchaseProductAsync(productId: string): Promise<boolean> {
  if (!isIapSupportedPlatform()) return false;
  await InAppPurchases.purchaseItemAsync(productId);
  return true;
}
