package com.margelo.nitro.broadcastevent
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class BroadcastEvent : HybridBroadcastEventSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
