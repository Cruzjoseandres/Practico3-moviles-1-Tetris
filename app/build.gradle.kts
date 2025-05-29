plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("com.google.devtools.ksp")

}

android {
    namespace = "com.example.practicaanimacion"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.practicaanimacion"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures{
        viewBinding = true
    }
}

dependencies {
//primero debe ir el ksp en kts a nivel de proyecto
    //en el plugging id("com.google.devtools.ksp") version "2.0.21-1.0.27" apply false
    //luego en el plugging del modulo id("com.google.devtools.ksp")
    //implementation("androidx.room:room-ktx:2.5.0")
    //luego sincronizar el proyecto
    // luego en dependencias ksp("androidx.room:room-compiler:2.5.0")
    //para room val room_version = "2.7.1"
    //room  implementation("androidx.room:room-ktx:$room_version")
    //luego sincroizar el proyecto y se arregla el compiler de kps

    //room  implementation("androidx.room:room-runtime:$room_version")
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.navigation.fragment.ktx)
    implementation(libs.androidx.navigation.ui.ktx)
    //ksp("androidx.room:room-compiler:2.5.0")
    ksp(libs.androidx.room.compiler)
    //para view model y livedata val lifecycle_version = "2.9.0"
    //viewmodel  implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:$lifecycle_version")
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    //livedata  implementation("androidx.lifecycle:lifecycle-livedata-ktx:$lifecycle_version")
    implementation(libs.androidx.lifecycle.livedata.ktx)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}