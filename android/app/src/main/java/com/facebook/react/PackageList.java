package com.facebook.react;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;

import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import java.util.Arrays;
import java.util.ArrayList;

public class PackageList {
  private Application application;
  private ReactNativeHost reactNativeHost;

  public PackageList(ReactNativeHost reactNativeHost) {
    this.reactNativeHost = reactNativeHost;
  }

  public PackageList(Application application) {
    this.reactNativeHost = null;
    this.application = application;
  }

  private ReactNativeHost getReactNativeHost() {
    return this.reactNativeHost;
  }

  private Resources getResources() {
    return this.getApplication().getResources();
  }

  private Application getApplication() {
    if (this.reactNativeHost == null) return this.application;
    return this.reactNativeHost.getApplication();
  }

  private Context getApplicationContext() {
    return this.getApplication().getApplicationContext();
  }

  private ReactPackage loadPackage(String className) {
    try {
      Class<?> clazz = Class.forName(className);
      return (ReactPackage) clazz.getDeclaredConstructor().newInstance();
    } catch (ClassNotFoundException e) {
      // Package not found - module might not be linked yet
      android.util.Log.w("PackageList", "Native module not found: " + className);
      return null;
    } catch (Exception e) {
      android.util.Log.w("PackageList", "Failed to load package: " + className + " - " + e.getMessage());
      return null;
    }
  }

  public ArrayList<ReactPackage> getPackages() {
    ArrayList<ReactPackage> packages = new ArrayList<>();
    packages.add(new MainReactPackage());
    
    // Autolinked native modules - loaded dynamically via reflection
    // React Native 0.72's Gradle plugin should handle linking automatically
    String[] autolinkedPackages = {
      "com.imagepicker.ImagePickerPackage",
      "com.th3rdwave.safeareacontext.SafeAreaContextPackage",
      "com.swmansion.rnscreens.RNScreensPackage",
      "com.oblador.vectoricons.VectorIconsPackage",
      "fr.greweb.reactnativeviewshot.RNViewShotPackage"
    };
    
    for (String className : autolinkedPackages) {
      ReactPackage pkg = loadPackage(className);
      if (pkg != null) {
        packages.add(pkg);
        android.util.Log.d("PackageList", "✓ Loaded package: " + className);
      } else {
        android.util.Log.w("PackageList", "✗ Failed to load package: " + className);
      }
    }
    
    return packages;
  }
}
