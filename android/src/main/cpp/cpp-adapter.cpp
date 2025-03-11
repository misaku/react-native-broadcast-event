#include <jni.h>
#include "broadcasteventOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::broadcastevent::initialize(vm);
}
