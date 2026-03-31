package com.example.androidofpcsense;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class HomeUiTest {

    @Rule
    public ActivityTestRule<MainActivity> activityRule = new ActivityTestRule<>(MainActivity.class);

    @Test
    public void heroSection_shouldShowPrimaryCtas() {
        onView(withText("Get Started")).check(matches(isDisplayed()));
        onView(withText("Chat with Expert")).check(matches(isDisplayed()));
        onView(withId(R.id.pc_builder_button)).check(matches(isDisplayed()));
    }

    @Test
    public void bottomNav_shouldShowCoreDestinations() {
        onView(withText("Home")).check(matches(isDisplayed()));
        onView(withText("PC Builder")).check(matches(isDisplayed()));
        onView(withText("Compare")).check(matches(isDisplayed()));
        onView(withText("Profile")).check(matches(isDisplayed()));
    }
}
