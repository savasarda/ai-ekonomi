const pem = '-----BEGIN PRIVATE KEY-----\\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDHcRAxmtg3B6r8\\nyF7s4K6+fO38o+ygFyEbgRpnpZ1RrE2FWWVATVV1M+9IlpNELaj3b0T0uPnJYiCr\\n2/AWEv2vUnvsdiZORAWw1UCh02XpNr/2O71aGmD6GB7XbuLTLLZtlselIC28/Llj\\n1OjyUlXYXonv5tECgT6GIt55+Tp1cU+MrULLq4Ku5nllUwVX3bltoAH1bl7ZCU0o\\n4lhlry+X+qLECYzSGjhNP31ypjKHOIbETVHop1gI1IWIAev3IHNuZ8U/W8G7Y6rR\\n9MAp9UmtoGva+z5Y8RYEr50amyirz1riPFbNgOWmmehNPspXEYaxliw8IlUvL792\\nIkCZLBZVAgMBAAECggEAQBe4kYhmdYDUVTn7L3qhDXxOasMvNt9X92PM3YQeg3Gw\\n0+q/nCN+FBUlj5k8KEvYIfQzH8YWF76eKzyZ8i4WMnJ6eqoZc0tu3L4bcCXkeUbr\\n97CJEFyrz5NSzf7Hi/+xfJRZAlrN+A7rcQap+b218rum7l6pynlIY4jvIBmUzMqU\\nqgC/+luLTide1XOuc+DTFLT74iNHJyOq57H+bFU6jhdB7KcvfBGDUAj8PYJlEU8j\\nwly93zrLOZFj4r8OLlcwdZ5EqkwOSCdlwfX0DqNWQ84qnz6nyRXHjjIL0Rc1X2i0\\nn+kn7/TwQRO4mymaNt5IWRhXLz7btqc6w66kOcGH/QKBgQDx22fKoYsOkNTv1y6/\\njQyTFpYB5Cr0Ms6ZJE+Tb7v2PVVeGS7V3JFgeFC53Wy+zX7i9x89+oQ1XcJUlg1j\\n4dR99FV9LQb5qCwauw7GNxdc1xXc/yv36StavLwdN4kALu7/y1HchQCqgfd8nudx\\nZPr0h3sfTWSK7gikKqbcddP5FwKBgQDTGrNEay/h8W0v/Gg4nxROvMCyilCQoRDH\\ni/ut38Vpnk2zxEgY7TuLMuzKoHwLD5lRhF1MPtbno2sA5OOcynDQ1+/ayi52H1PW\\nO4mb6LyiIXLD4vpUENJN69s2oEpF3xnyVCsiAtEb5FiYD5q08UFtbU2f8TVWLbej\\np0lrhL3cwKBgDo3RMl6jv1HkWnV0vPaoL86/YqhAFHddOtZ2Sm1CHpiEw1eZG6n\\n8/pTm6LRkJ5w2m0JbOS/S1mJIwC3SavULRDQYk+KKhaoC0233vuJQT9gqmuSpGO9\\nJWlm6qThvEFmCrNZnm/FN/7S396IZU9fLiT0A4fqWhwy5bOWbKm+VvKrAoGAOpU/\\nSG5idFY2Ucm+9m+XCB6zbxiZMPmxmV7Mcj0WILBQqeF/jINRMdjpA3Yz1jH2/zs3\\nVPBfXRrpl+7tB1bapeo24sWWzSr2bg5Jqt2Uc33KxneXtnqQkhUw2WD0G53FKo2X\\nBrI3a4Eb4N77tNj6qi5aC1e50HeRbaq2W32KP+cCgYBaLEijyKRmQGeiLzJ24Zff\\nIiKTm+ltVuuefzg9RulQgCxRZcZpZdFfuElRijUi121eM47FVEL6zWcxD+hsf1JY\\nWzcVtBpdtK23TzGuwdqk6LCwdqyooKmLRu8j7VCS29sKUS0ofupFBY1sXlxkMGoW\\nHvMUTlyz5EUt1LikiMYmiw==\\n-----END PRIVATE KEY-----\\n';

let cleanPem = pem.replace(/-----BEGIN PRIVATE KEY-----/gi, "").replace(/-----END PRIVATE KEY-----/gi, "");
cleanPem = cleanPem.replace(/\\n/g, "");
let base64 = cleanPem.replace(/[^A-Za-z0-9+/]/g, "");
while (base64.length % 4 !== 0) {
  base64 += "=";
}
console.log(base64);
try {
  atob(base64);
} catch (e) {
  console.log("Error from atob", e);
}
